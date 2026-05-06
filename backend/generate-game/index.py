import json
import os
import urllib.request
import re


API_URL = "https://api.aitunnel.ru/v1/chat/completions"
MODEL = "gpt-4o-mini"


def handler(event: dict, context) -> dict:
    """Генерирует игру для урока на основе предмета, класса, времени и темы."""

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

    api_key = os.environ.get('AITUNNEL_API_KEY', '')
    body = json.loads(event.get('body') or '{}')

    subject = body.get('subject', '')
    grade = body.get('grade', '')
    duration = body.get('duration', '10 мин')
    topic = body.get('topic', '')

    prompt = f"""Ты опытный педагог и методист. Придумай увлекательную образовательную игру для урока.

Данные:
- Предмет: {subject}
- Класс: {grade}
- Тема урока: {topic}
- Время на игру: {duration}

Сгенерируй игру строго в JSON-формате (только JSON, без markdown-блоков):
{{
  "name": "Название игры",
  "type": "Тип игры (викторина/ролевая/командная/индивидуальная/интерактивная)",
  "duration": "{duration}",
  "subject": "{subject}",
  "grade": "{grade}",
  "topic": "{topic}",
  "goal": "Цель игры — чему учит",
  "description": "Подробное описание игры (3-4 предложения)",
  "materials": "Что нужно для игры (или 'Ничего, только участники')",
  "rules": [
    "Правило 1",
    "Правило 2",
    "Правило 3",
    "Правило 4"
  ],
  "steps": [
    {{"step": 1, "duration": "X мин", "action": "Описание шага"}},
    {{"step": 2, "duration": "X мин", "action": "Описание шага"}},
    {{"step": 3, "duration": "X мин", "action": "Описание шага"}}
  ],
  "teacher_tips": ["Совет учителю 1", "Совет учителю 2"],
  "variations": "Варианты усложнения или упрощения игры"
}}

Игра должна быть реально применимой, весёлой и обучающей. Учитывай возраст учеников ({grade}) и укладывайся строго в {duration}."""

    request_body = json.dumps({
        'model': MODEL,
        'messages': [
            {'role': 'system', 'content': 'Ты профессиональный педагог-методист с 20-летним опытом. Придумываешь увлекательные образовательные игры. Отвечаешь только валидным JSON без markdown-блоков.'},
            {'role': 'user', 'content': prompt}
        ],
        'temperature': 0.85,
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
    content = re.sub(r'^```(?:json)?\s*', '', content.strip())
    content = re.sub(r'\s*```$', '', content.strip())

    game = json.loads(content)

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True, 'game': game}, ensure_ascii=False)
    }
