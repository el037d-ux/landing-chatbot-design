import json
import os
import urllib.request
import urllib.error
import re



API_URL = "https://api.aitunnel.ru/v1/chat/completions"
MODEL = "gpt-4o-mini"


def handler(event: dict, context) -> dict:
    """Генерирует план урока с помощью DeepSeek-V4-Pro через HuggingFace на основе данных от педагога."""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    body = json.loads(event.get('body') or '{}')
    subject = body.get('subject', '')
    grade = body.get('grade', '')
    topic = body.get('topic', '')
    duration = body.get('duration', '45 мин')
    goal = body.get('goal', '')
    tasks = body.get('tasks', '')
    plan = body.get('plan', '')
    evaluation = body.get('evaluation', '')

    prompt = f"""Ты опытный методист и педагог. Педагог заполнил форму подготовки урока. 
На основе этих данных создай подробный, структурированный и вдохновляющий план урока.

Данные от педагога:
- Предмет: {subject}
- Класс: {grade}
- Тема урока: {topic}
- Длительность урока: {duration}
- Цель урока: {goal}
- Задачи урока: {tasks}
- Предварительный план: {plan}
- Способ оценивания: {evaluation}

Сгенерируй детальный план урока в следующем JSON-формате (только JSON, без пояснений):
{{
  "title": "Название урока",
  "duration": "{duration}",
  "overview": "Краткое описание урока (2-3 предложения)",
  "stages": [
    {{
      "name": "Название этапа",
      "duration": "X мин",
      "description": "Подробное описание действий учителя и учеников",
      "method": "Метод/приём",
      "materials": "Необходимые материалы"
    }}
  ],
  "activities": [
    {{
      "title": "Название активности",
      "type": "игра/дискуссия/практика/квиз/творческое задание",
      "description": "Описание активности",
      "duration": "X мин"
    }}
  ],
  "assessment": {{
    "methods": ["метод 1", "метод 2", "метод 3"],
    "criteria": ["критерий 1", "критерий 2", "критерий 3"],
    "tools": "Инструменты оценивания"
  }},
  "homework": "Домашнее задание (если нужно)",
  "tips": ["Совет педагогу 1", "Совет педагогу 2", "Совет педагогу 3"]
}}

Сделай план живым, практичным и вдохновляющим. Учти возраст учеников ({grade}), специфику предмета ({subject}) и строго укладывайся в {duration}."""

    api_keys = [
        os.environ.get('HF_CZMZIXBFNSMAUXQXJHGBOPPPDKBCJMHDTA', ''),
        os.environ.get('HF_WMVWGJFDIZMEVGKKLOPDYNNKEJSWVKLATC', ''),
        os.environ.get('SKAITUNNELXL4JLFACOC4NIGGQSXA1VGEBGSAOBMSU', ''),
        os.environ.get('HUGGINGFACE_API_KEY', ''),
    ]

    request_body = json.dumps({
        'model': MODEL,
        'messages': [
            {'role': 'system', 'content': 'Ты профессиональный методист и педагог с 20-летним опытом. Отвечаешь только валидным JSON без markdown-блоков.'},
            {'role': 'user', 'content': prompt}
        ],
        'temperature': 0.7,
        'max_tokens': 2000,
    }).encode('utf-8')

    result = None
    last_error = None
    for api_key in api_keys:
        if not api_key:
            continue
        try:
            req = urllib.request.Request(
                API_URL,
                data=request_body,
                headers={
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json',
                },
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=60) as response:
                result = json.loads(response.read().decode('utf-8'))
            break
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8', errors='replace')
            print(f"[KEY_TRY] code={e.code} key_prefix={api_key[:12]} body={error_body[:300]}")
            last_error = e
            if e.code not in (401, 403):
                raise

    if result is None:
        raise last_error

    content = result['choices'][0]['message']['content']

    # Убираем markdown-обёртку если модель её добавила
    content = re.sub(r'^```(?:json)?\s*', '', content.strip())
    content = re.sub(r'\s*```$', '', content.strip())

    lesson_plan = json.loads(content)

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True, 'lesson': lesson_plan}, ensure_ascii=False)
    }