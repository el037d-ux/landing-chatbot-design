import json
import os
import hashlib
import secrets
import psycopg2
import psycopg2.errors

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p75689129_landing_chatbot_desi')


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
    """Регистрация, вход, смена имени и пароля."""

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

        else:
            return {'statusCode': 400, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Неизвестное действие'})}

    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return {'statusCode': 409, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Пользователь с таким email уже существует'})}
    finally:
        cur.close()
        conn.close()
