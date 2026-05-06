import json
import os
import urllib.request
import urllib.error
import re



API_URL = "https://api.aitunnel.ru/v1/chat/completions"
MODEL = "gpt-4o-mini"


def handler(event: dict, context) -> dict:
    """Генерирует план урока с помощью ИИ через AITunnel на основе данных от педагога."""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    api_keys = [
        os.environ.get('SKAITUNNELRBPZJ8RKNKNPSD5QXPMHYIX8SFXT31EZ', ''),
        os.environ.get('SKAITUNNELDXV2LRANTQXXAUHAKKHDIJCMX5UANI87', ''),
        os.environ.get('AITUNNEL_API_KEY', ''),
        os.environ.get('AITUNNEL', ''),
    ]
    api_key = next((k for k in api_keys if k.startswith('sk-')), '')

    body = json.loads(event.get('body') or '{}')

    if body.get('action') == 'list_models':
        req = urllib.request.Request(
            'https://api.aitunnel.ru/v1/models',
            headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
            method='GET'
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            models_data = json.loads(resp.read().decode('utf-8'))
        model_ids = [m['id'] for m in models_data.get('data', [])]
        print(f"[MODELS] {model_ids}")
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'models': model_ids}, ensure_ascii=False)
        }
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

    request_body = json.dumps({
        'model': MODEL,
        'messages': [
            {'role': 'system', 'content': 'Ты профессиональный методист и педагог с 20-летним опытом. Отвечаешь только валидным JSON без markdown-блоков.'},
            {'role': 'user', 'content': prompt}
        ],
        'temperature': 0.7,
        'max_tokens': 2000,
    }).encode('utf-8')

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