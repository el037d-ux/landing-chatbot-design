import json
import os
import hashlib
import secrets
import smtplib
import uuid
import base64
import urllib.request
import urllib.error
import psycopg2
import psycopg2.errors
from datetime import datetime, timezone, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p75689129_landing_chatbot_desi')
PLAN_DAYS = {'7days': 7, '30days': 30}
PLAN_LABELS = {'7days': '7 дней — 69 ₽', '30days': '30 дней — 260 ₽'}
SITE_URL = 'https://landing-chatbot-design.poehali.dev'


def send_activation_email(to_email: str, plan: str, link: str):
    smtp_from = os.environ.get('SMTP_FROM', '')
    smtp_password = os.environ.get('SMTP_PASSWORD', '')
    if not smtp_from or not smtp_password:
        return False
    plan_label = PLAN_LABELS.get(plan, plan)
    days = PLAN_DAYS.get(plan, 7)
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'УрокАИ — ваша ссылка для активации подписки'
    msg['From'] = f'УрокАИ <{smtp_from}>'
    msg['To'] = to_email
    html = f"""<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#1a7c3e,#2da55f);padding:32px;text-align:center;">
<div style="font-size:28px;font-weight:900;color:#ffffff;">УрокАИ</div>
<div style="font-size:14px;color:rgba(255,255,255,0.8);margin-top:4px;">ИИ-помощник для педагогов</div>
</td></tr>
<tr><td style="padding:36px 32px;">
<h2 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#1a1f2e;">Ваша подписка готова!</h2>
<p style="margin:0 0 8px;font-size:15px;color:#6b7280;">Тариф: <strong style="color:#1a1f2e;">{plan_label}</strong></p>
<p style="margin:0 0 28px;font-size:15px;color:#6b7280;">Нажмите кнопку — вы автоматически войдёте и подписка активируется на <strong style="color:#1a1f2e;">{days} дней</strong>.</p>
<div style="text-align:center;margin:28px 0;">
<a href="{link}" style="display:inline-block;padding:16px 36px;background:#1a7c3e;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;border-radius:12px;">Активировать подписку →</a>
</div>
<div style="background:#f8fffe;border:1px solid #d1fae5;border-radius:10px;padding:16px;">
<p style="margin:0;font-size:13px;color:#6b7280;">⏱ Ссылка действует <strong>48 часов</strong>.</p>
</div>
<p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">Если кнопка не работает: <span style="color:#1a7c3e;word-break:break-all;">{link}</span></p>
</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid #f0f0f0;text-align:center;">
<p style="margin:0;font-size:12px;color:#9ca3af;">© 2025 УрокАИ</p>
</td></tr>
</table></td></tr></table></body></html>"""
    msg.attach(MIMEText(html, 'html', 'utf-8'))
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(smtp_from, smtp_password)
        server.sendmail(smtp_from, to_email, msg.as_bytes())
    return True


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def get_user_from_token(cur, token):
    cur.execute(
        f"SELECT s.user_id, u.email, u.name FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id=s.user_id WHERE s.token=%s AND s.expires_at > NOW()",
        (token,)
    )
    return cur.fetchone()


def handler(event: dict, context) -> dict:
    """Регистрация, вход, смена имени, пароля и оплата ЮКасса."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'}, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action')

    conn = get_conn()
    cur = conn.cursor()

    try:
        if action == 'register':
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')
            name = body.get('name', '').strip()

            if not email or not password:
                return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Email и пароль обязательны'})}

            pw_hash = hash_password(password)
            cur.execute(f"INSERT INTO {SCHEMA}.users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id", (email, pw_hash, name))
            user_id = cur.fetchone()[0]
            cur.execute(f"INSERT INTO {SCHEMA}.usage_counts (user_id) VALUES (%s)", (user_id,))
            cur.execute(f"INSERT INTO {SCHEMA}.subscriptions (user_id, plan) VALUES (%s, 'free')", (user_id,))
            token = secrets.token_hex(32)
            cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)", (user_id, token))
            conn.commit()
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True, 'token': token, 'user': {'id': user_id, 'email': email, 'name': name}})
            }

        elif action == 'login':
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')

            if not email or not password:
                return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Email и пароль обязательны'})}

            pw_hash = hash_password(password)
            cur.execute(f"SELECT id, email, name FROM {SCHEMA}.users WHERE email=%s AND password_hash=%s", (email, pw_hash))
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Неверный email или пароль'})}
            user_id, email, name = row
            token = secrets.token_hex(32)
            cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)", (user_id, token))
            conn.commit()
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True, 'token': token, 'user': {'id': user_id, 'email': email, 'name': name}})
            }

        elif action == 'update_name':
            raw_token = (event.get('headers') or {}).get('X-Authorization', '').replace('Bearer ', '')
            row = get_user_from_token(cur, raw_token)
            if not row:
                return {'statusCode': 401, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Сессия истекла'})}
            user_id = row[0]
            new_name = body.get('name', '').strip()
            if not new_name or len(new_name) < 2:
                return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Имя слишком короткое'})}
            cur.execute(f"UPDATE {SCHEMA}.users SET name=%s WHERE id=%s", (new_name, user_id))
            conn.commit()
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True})
            }

        elif action == 'change_password':
            raw_token = (event.get('headers') or {}).get('X-Authorization', '').replace('Bearer ', '')
            row = get_user_from_token(cur, raw_token)
            if not row:
                return {'statusCode': 401, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Сессия истекла'})}
            user_id = row[0]
            old_password = body.get('old_password', '')
            new_password = body.get('new_password', '')
            if not old_password or not new_password:
                return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Укажите текущий и новый пароль'})}
            if len(new_password) < 6:
                return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Новый пароль слишком короткий'})}
            old_hash = hash_password(old_password)
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE id=%s AND password_hash=%s", (user_id, old_hash))
            if not cur.fetchone():
                return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Неверный текущий пароль'})}
            new_hash = hash_password(new_password)
            cur.execute(f"UPDATE {SCHEMA}.users SET password_hash=%s WHERE id=%s", (new_hash, user_id))
            conn.commit()
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True})
            }

        elif action == 'generate_payment_link':
            email = body.get('email', '').strip().lower()
            plan = body.get('plan', '')
            if not email or '@' not in email:
                return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Введите корректный email'})}
            if plan not in PLAN_DAYS:
                return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Неверный тариф'})}

            pay_token = secrets.token_urlsafe(32)
            link_expires = datetime.now(timezone.utc) + timedelta(hours=48)
            cur.execute(
                f"INSERT INTO {SCHEMA}.payment_links (token, email, plan, expires_at) VALUES (%s, %s, %s, %s)",
                (pay_token, email, plan, link_expires)
            )
            conn.commit()
            link = f"{SITE_URL}/activate/{pay_token}"
            try:
                send_activation_email(email, plan, link)
                email_sent = True
            except Exception:
                email_sent = False
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True, 'email_sent': email_sent, 'link': link}, ensure_ascii=False)
            }

        elif action == 'activate':
            pay_token = body.get('token', '').strip()
            if not pay_token:
                return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Токен не указан'})}

            cur.execute(
                f"SELECT id, email, plan, used, expires_at FROM {SCHEMA}.payment_links WHERE token=%s",
                (pay_token,)
            )
            link_row = cur.fetchone()
            if not link_row:
                return {'statusCode': 404, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Ссылка не найдена'})}

            link_id, link_email, plan, used, link_expires = link_row

            if used:
                return {'statusCode': 410, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Ссылка уже была использована'})}

            if link_expires < datetime.now(timezone.utc):
                return {'statusCode': 410, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Срок действия ссылки истёк'})}

            cur.execute(f"SELECT id, name FROM {SCHEMA}.users WHERE email=%s", (link_email,))
            user_row = cur.fetchone()

            if user_row:
                user_id, name = user_row
            else:
                name = link_email.split('@')[0]
                cur.execute(
                    f"INSERT INTO {SCHEMA}.users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id",
                    (link_email, hashlib.sha256(secrets.token_hex(16).encode()).hexdigest(), name)
                )
                user_id = cur.fetchone()[0]
                cur.execute(f"INSERT INTO {SCHEMA}.usage_counts (user_id) VALUES (%s)", (user_id,))
                cur.execute(f"INSERT INTO {SCHEMA}.subscriptions (user_id, plan) VALUES (%s, 'free')", (user_id,))

            days = PLAN_DAYS.get(plan, 7)
            sub_expires = datetime.now(timezone.utc) + timedelta(days=days)
            cur.execute(f"UPDATE {SCHEMA}.subscriptions SET is_active=FALSE WHERE user_id=%s AND plan!='free'", (user_id,))
            cur.execute(
                f"INSERT INTO {SCHEMA}.subscriptions (user_id, plan, is_active, expires_at) VALUES (%s, %s, TRUE, %s)",
                (user_id, plan, sub_expires)
            )

            session_token = secrets.token_hex(32)
            cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)", (user_id, session_token))
            cur.execute(f"UPDATE {SCHEMA}.payment_links SET used=TRUE WHERE id=%s", (link_id,))
            conn.commit()

            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({
                    'ok': True,
                    'token': session_token,
                    'plan': plan,
                    'expires_at': sub_expires.isoformat(),
                    'user': {'id': user_id, 'email': link_email, 'name': name}
                }, ensure_ascii=False)
            }

        elif action == 'create_payment':
            plan_id = body.get('plan')
            plans = {
                '7days':  {'amount': '69.00',  'label': 'Подписка на 7 дней'},
                '30days': {'amount': '260.00', 'label': 'Подписка на 30 дней'},
            }
            plan = plans.get(plan_id)
            if not plan:
                return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Неверный тариф'})}

            email = body.get('email', '').strip().lower()
            return_url = f"{SITE_URL}/?payment=success"

            payment_data = {
                'amount': {'value': plan['amount'], 'currency': 'RUB'},
                'confirmation': {'type': 'redirect', 'return_url': return_url},
                'capture': True,
                'description': plan['label'],
                'metadata': {'plan': plan_id, 'email': email},
            }
            if email:
                payment_data['receipt'] = {
                    'customer': {'email': email},
                    'items': [{
                        'description': plan['label'],
                        'quantity': '1.00',
                        'amount': {'value': plan['amount'], 'currency': 'RUB'},
                        'vat_code': 1,
                        'payment_mode': 'full_payment',
                        'payment_subject': 'service',
                    }]
                }

            shop_id = os.environ['API_KEY_ID']
            secret_key = os.environ['API_KEY_YOOKASSA']
            credentials = base64.b64encode(f"{shop_id}:{secret_key}".encode()).decode()
            req = urllib.request.Request(
                'https://api.yookassa.ru/v3/payments',
                data=json.dumps(payment_data).encode(),
                headers={
                    'Authorization': f'Basic {credentials}',
                    'Content-Type': 'application/json',
                    'Idempotence-Key': str(uuid.uuid4()),
                },
                method='POST'
            )
            try:
                with urllib.request.urlopen(req) as resp:
                    result = json.loads(resp.read().decode())
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'ok': True, 'payment_id': result['id'], 'confirmation_url': result['confirmation']['confirmation_url']})
                }
            except urllib.error.HTTPError as e:
                err_body = e.read().decode()
                return {'statusCode': 500, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': f'ЮКасса: {err_body}'})}

        elif action == 'check_payment':
            payment_id = body.get('payment_id')
            if not payment_id:
                return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Нет payment_id'})}

            shop_id = os.environ['API_KEY_ID']
            secret_key = os.environ['API_KEY_YOOKASSA']
            credentials = base64.b64encode(f"{shop_id}:{secret_key}".encode()).decode()
            req = urllib.request.Request(
                f'https://api.yookassa.ru/v3/payments/{payment_id}',
                headers={'Authorization': f'Basic {credentials}'},
                method='GET'
            )
            try:
                with urllib.request.urlopen(req) as resp:
                    result = json.loads(resp.read().decode())
                status = result.get('status')
                paid = result.get('paid', False)
                metadata = result.get('metadata', {})

                if paid and status == 'succeeded':
                    plan_id = metadata.get('plan')
                    link_email = metadata.get('email', '').strip().lower()
                    if plan_id and link_email:
                        cur.execute(f"SELECT id, name FROM {SCHEMA}.users WHERE email=%s", (link_email,))
                        user_row = cur.fetchone()
                        if user_row:
                            user_id, name = user_row
                        else:
                            name = link_email.split('@')[0]
                            cur.execute(
                                f"INSERT INTO {SCHEMA}.users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id",
                                (link_email, hashlib.sha256(secrets.token_hex(16).encode()).hexdigest(), name)
                            )
                            user_id = cur.fetchone()[0]
                            cur.execute(f"INSERT INTO {SCHEMA}.usage_counts (user_id) VALUES (%s)", (user_id,))
                            cur.execute(f"INSERT INTO {SCHEMA}.subscriptions (user_id, plan) VALUES (%s, 'free')", (user_id,))

                        days = PLAN_DAYS.get(plan_id, 7)
                        sub_expires = datetime.now(timezone.utc) + timedelta(days=days)
                        cur.execute(f"UPDATE {SCHEMA}.subscriptions SET is_active=FALSE WHERE user_id=%s AND plan!='free'", (user_id,))
                        cur.execute(
                            f"INSERT INTO {SCHEMA}.subscriptions (user_id, plan, is_active, expires_at) VALUES (%s, %s, TRUE, %s) ON CONFLICT DO NOTHING",
                            (user_id, plan_id, sub_expires)
                        )
                        session_token = secrets.token_hex(32)
                        cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)", (user_id, session_token))
                        conn.commit()
                        return {
                            'statusCode': 200,
                            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                            'body': json.dumps({'ok': True, 'status': status, 'paid': paid, 'token': session_token, 'user': {'id': user_id, 'email': link_email, 'name': name}})
                        }

                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'ok': True, 'status': status, 'paid': paid})
                }
            except urllib.error.HTTPError as e:
                err_body = e.read().decode()
                return {'statusCode': 500, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': f'ЮКасса: {err_body}'})}

        elif action == 'send_email':
            to = body.get('to', '').strip()
            subject = body.get('subject', '').strip()
            html = body.get('html', '').strip()
            text = body.get('text', '').strip()
            if not to or not subject or not html:
                return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Поля to, subject и html обязательны'})}
            smtp_from = os.environ.get('SMTP_FROM', '')
            smtp_password = os.environ.get('SMTP_PASSWORD', '')
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = smtp_from
            msg['To'] = to
            if text:
                msg.attach(MIMEText(text, 'plain', 'utf-8'))
            msg.attach(MIMEText(html, 'html', 'utf-8'))
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                server.login(smtp_from, smtp_password)
                server.sendmail(smtp_from, to, msg.as_string())
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True})
            }

        else:
            return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Неизвестное действие'})}

    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return {'statusCode': 409, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Пользователь с таким email уже существует'})}
    finally:
        cur.close()
        conn.close()