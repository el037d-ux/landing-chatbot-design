import json
import os
import psycopg2
from datetime import datetime, timezone

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p75689129_landing_chatbot_desi')

FREE_LIMITS = {'lessons': 5, 'games': 5, 'analyses': 0, 'chat': 8}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_user_from_token(cur, token):
    cur.execute(
        f"SELECT s.user_id, u.email, u.name FROM {SCHEMA}.sessions s JOIN {SCHEMA}.users u ON u.id=s.user_id WHERE s.token=%s AND s.expires_at > NOW()",
        (token,)
    )
    return cur.fetchone()


def cors():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
        'Content-Type': 'application/json',
    }


def handler(event: dict, context) -> dict:
    """Статус пользователя, история ИИ-запросов и сохранённые материалы."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    token = (event.get('headers') or {}).get('X-Authorization', '').replace('Bearer ', '').strip()
    body = json.loads(event.get('body') or '{}')
    action = body.get('action') or (event.get('queryStringParameters') or {}).get('action', '')
    resource = body.get('resource')

    conn = get_conn()
    cur = conn.cursor()

    try:
        if not token:
            return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'ok': False, 'error': 'Не авторизован'})}

        row = get_user_from_token(cur, token)
        if not row:
            return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'ok': False, 'error': 'Сессия истекла'})}

        user_id, email, name = row

        # --- ИСТОРИЯ ИИ-запросов ---
        if action == 'get_history':
            page = int((event.get('queryStringParameters') or {}).get('page', 0))
            per_page = 10
            offset = page * per_page
            cur.execute(
                f"SELECT id, type, title, prompt, created_at FROM {SCHEMA}.ai_history WHERE user_id=%s ORDER BY created_at DESC LIMIT %s OFFSET %s",
                (user_id, per_page, offset)
            )
            rows = cur.fetchall()
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.ai_history WHERE user_id=%s", (user_id,))
            total = cur.fetchone()[0]
            items = [{'id': r[0], 'type': r[1], 'title': r[2], 'prompt': r[3], 'created_at': r[4].isoformat() if r[4] else None} for r in rows]
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'ok': True, 'items': items, 'total': total, 'page': page})}

        # --- Добавить в историю ---
        elif action == 'add_history':
            item_type = body.get('type', 'lesson')
            title = (body.get('title') or '').strip()
            prompt = (body.get('prompt') or '').strip()
            result = (body.get('result') or '').strip()
            if not title:
                return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'ok': False, 'error': 'Нет заголовка'})}
            cur.execute(
                f"INSERT INTO {SCHEMA}.ai_history (user_id, type, title, prompt, result) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                (user_id, item_type, title, prompt, result)
            )
            history_id = cur.fetchone()[0]
            conn.commit()
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'ok': True, 'id': history_id})}

        # --- СОХРАНЁННЫЕ МАТЕРИАЛЫ ---
        elif action == 'get_saved':
            page = int((event.get('queryStringParameters') or {}).get('page', 0))
            per_page = 10
            offset = page * per_page
            cur.execute(
                f"SELECT id, type, title, history_id, created_at FROM {SCHEMA}.saved_materials WHERE user_id=%s AND is_archived=FALSE ORDER BY created_at DESC LIMIT %s OFFSET %s",
                (user_id, per_page, offset)
            )
            rows = cur.fetchall()
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.saved_materials WHERE user_id=%s AND is_archived=FALSE", (user_id,))
            total = cur.fetchone()[0]
            items = [{'id': r[0], 'type': r[1], 'title': r[2], 'history_id': r[3], 'created_at': r[4].isoformat() if r[4] else None} for r in rows]
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'ok': True, 'items': items, 'total': total})}

        elif action == 'save_material':
            item_type = body.get('type', 'lesson')
            title = (body.get('title') or '').strip()
            content = (body.get('content') or '').strip()
            history_id = body.get('history_id')
            if not title:
                return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'ok': False, 'error': 'Нет заголовка'})}
            cur.execute(
                f"INSERT INTO {SCHEMA}.saved_materials (user_id, type, title, content, history_id) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                (user_id, item_type, title, content, history_id)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'ok': True, 'id': new_id})}

        elif action == 'unsave_material':
            material_id = body.get('id')
            if not material_id:
                return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'ok': False, 'error': 'Нет id'})}
            cur.execute(
                f"UPDATE {SCHEMA}.saved_materials SET is_archived=TRUE WHERE id=%s AND user_id=%s RETURNING id",
                (material_id, user_id)
            )
            if not cur.fetchone():
                return {'statusCode': 404, 'headers': cors(), 'body': json.dumps({'ok': False, 'error': 'Не найдено'})}
            conn.commit()
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'ok': True})}

        elif action == 'get_material_content':
            material_id = body.get('id') or (event.get('queryStringParameters') or {}).get('id')
            if not material_id:
                return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'ok': False, 'error': 'Нет id'})}
            cur.execute(
                f"SELECT id, type, title, content, created_at FROM {SCHEMA}.saved_materials WHERE id=%s AND user_id=%s AND is_archived=FALSE",
                (material_id, user_id)
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 404, 'headers': cors(), 'body': json.dumps({'ok': False, 'error': 'Не найдено'})}
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'ok': True, 'item': {'id': row[0], 'type': row[1], 'title': row[2], 'content': row[3], 'created_at': row[4].isoformat() if row[4] else None}})}

        # --- Стандартный статус пользователя ---
        cur.execute(
            f"SELECT plan, expires_at FROM {SCHEMA}.subscriptions WHERE user_id=%s AND is_active=TRUE ORDER BY started_at DESC LIMIT 1",
            (user_id,)
        )
        sub = cur.fetchone()
        plan = sub[0] if sub else 'free'
        expires_at = sub[1] if sub else None

        if plan != 'free' and expires_at:
            if expires_at < datetime.now(timezone.utc):
                cur.execute(f"UPDATE {SCHEMA}.subscriptions SET is_active=FALSE WHERE user_id=%s AND plan!='free'", (user_id,))
                conn.commit()
                plan = 'free'

        cur.execute(f"SELECT lessons_used, games_used, analyses_used, chat_used FROM {SCHEMA}.usage_counts WHERE user_id=%s", (user_id,))
        usage_row = cur.fetchone()
        usage = {'lessons': usage_row[0], 'games': usage_row[1], 'analyses': usage_row[2], 'chat': usage_row[3]} if usage_row else {'lessons': 0, 'games': 0, 'analyses': 0, 'chat': 0}

        if action == 'increment' and resource in ('lessons', 'games', 'analyses', 'chat'):
            col = f"{resource}_used"
            cur.execute(f"UPDATE {SCHEMA}.usage_counts SET {col}={col}+1, updated_at=NOW() WHERE user_id=%s", (user_id,))
            conn.commit()
            usage[resource] += 1

        is_paid = plan != 'free'
        limits = {
            'lessons': 999 if is_paid else FREE_LIMITS['lessons'],
            'games': 999 if is_paid else FREE_LIMITS['games'],
            'analyses': 999 if is_paid else FREE_LIMITS['analyses'],
            'chat': 999 if is_paid else FREE_LIMITS['chat'],
        }
        can_use = {k: usage[k] < limits[k] for k in limits}

        return {
            'statusCode': 200,
            'headers': cors(),
            'body': json.dumps({
                'ok': True,
                'user': {'id': user_id, 'email': email, 'name': name},
                'plan': plan,
                'expires_at': expires_at.isoformat() if expires_at else None,
                'usage': usage,
                'limits': limits,
                'can_use': can_use,
            }, ensure_ascii=False)
        }
    finally:
        cur.close()
        conn.close()