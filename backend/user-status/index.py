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


def handler(event: dict, context) -> dict:
    """Возвращает статус пользователя: подписка, счётчики использования, лимиты."""

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'}, 'body': ''}

    token = (event.get('headers') or {}).get('X-Authorization', '').replace('Bearer ', '')
    body = json.loads(event.get('body') or '{}')

    # Если action=increment — увеличить счётчик
    action = body.get('action')
    resource = body.get('resource')  # 'lessons', 'games', 'analyses'

    conn = get_conn()
    cur = conn.cursor()

    try:
        if not token:
            return {'statusCode': 401, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Не авторизован'})}

        row = get_user_from_token(cur, token)
        if not row:
            return {'statusCode': 401, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'ok': False, 'error': 'Сессия истекла'})}

        user_id, email, name = row

        # Получаем активную подписку
        cur.execute(
            f"SELECT plan, expires_at FROM {SCHEMA}.subscriptions WHERE user_id=%s AND is_active=TRUE ORDER BY started_at DESC LIMIT 1",
            (user_id,)
        )
        sub = cur.fetchone()
        plan = sub[0] if sub else 'free'
        expires_at = sub[1] if sub else None

        # Проверяем истечение платной подписки
        if plan != 'free' and expires_at:
            if expires_at < datetime.now(timezone.utc):
                cur.execute(f"UPDATE {SCHEMA}.subscriptions SET is_active=FALSE WHERE user_id=%s AND plan!='free'", (user_id,))
                conn.commit()
                plan = 'free'

        # Счётчики использования
        cur.execute(f"SELECT lessons_used, games_used, analyses_used, chat_used FROM {SCHEMA}.usage_counts WHERE user_id=%s", (user_id,))
        usage_row = cur.fetchone()
        usage = {'lessons': usage_row[0], 'games': usage_row[1], 'analyses': usage_row[2], 'chat': usage_row[3]} if usage_row else {'lessons': 0, 'games': 0, 'analyses': 0, 'chat': 0}

        # Увеличить счётчик
        if action == 'increment' and resource in ('lessons', 'games', 'analyses', 'chat'):
            col = f"{resource}_used"
            cur.execute(f"UPDATE {SCHEMA}.usage_counts SET {col}={col}+1, updated_at=NOW() WHERE user_id=%s", (user_id,))
            conn.commit()
            usage[resource] += 1

        # Лимиты
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
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
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