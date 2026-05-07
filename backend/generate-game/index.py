import json
import os
import urllib.request
import re


API_URL = "https://api.aitunnel.ru/v1/chat/completions"
MODEL = "gpt-4o-mini"


def handler(event: dict, context) -> dict:
    """Генерирует подробную образовательную игру для урока по развёрнутому промту."""

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
    duration = body.get('duration', '25 мин')
    topic = body.get('topic', '')
    students_count = body.get('students_count', '25–30')
    game_format = body.get('game_format', '')
    lesson_goal = body.get('lesson_goal', '')
    tech = body.get('tech', 'доска и маркеры')

    prompt = f"""Ты опытный педагог-методист с 20-летним стажем, эксперт по геймификации в образовании.

📌 Параметры:
- Предмет/тема: {subject} — {topic}
- Класс/возраст: {grade}
- Количество учеников: {students_count}
- Длительность: {duration}
- Формат: {game_format if game_format else 'на твоё усмотрение'}
- Цель урока: {lesson_goal if lesson_goal else f'закрепить материал по теме {topic}'}
- Технические возможности: {tech}

Сгенерируй подробную образовательную игру строго в JSON-формате (только JSON, без markdown-блоков):
{{
  "name": "Название игры",
  "legend": "Краткая легенда/сеттинг — 1–2 предложения",
  "type": "Тип игры",
  "duration": "{duration}",
  "subject": "{subject}",
  "grade": "{grade}",
  "topic": "{topic}",
  "goal": "Цель игры — чему учит",
  "description": "Описание игры (3–4 предложения)",
  "teams": "Описание разделения на команды/роли",
  "materials": "Что нужно подготовить учителю (распечатать, вырезать, написать заранее)",
  "rules": [
    "Правило 1",
    "Правило 2",
    "Правило 3",
    "Правило 4",
    "Правило 5"
  ],
  "steps": [
    {{"step": 1, "duration": "X мин", "action": "Подробное описание шага"}},
    {{"step": 2, "duration": "X мин", "action": "Подробное описание шага"}},
    {{"step": 3, "duration": "X мин", "action": "Подробное описание шага"}},
    {{"step": 4, "duration": "X мин", "action": "Подробное описание шага"}}
  ],
  "scoring": "Система подсчёта баллов и критерии победы",
  "game_materials": [
    {{"type": "Тип материала (вопрос/карточка/задание)", "content": "Готовый текст для печати 1"}},
    {{"type": "Тип материала", "content": "Готовый текст для печати 2"}},
    {{"type": "Тип материала", "content": "Готовый текст для печати 3"}},
    {{"type": "Тип материала", "content": "Готовый текст для печати 4"}},
    {{"type": "Тип материала", "content": "Готовый текст для печати 5"}},
    {{"type": "Тип материала", "content": "Готовый текст для печати 6"}},
    {{"type": "Тип материала", "content": "Готовый текст для печати 7"}},
    {{"type": "Тип материала", "content": "Готовый текст для печати 8"}}
  ],
  "adaptation": "Как упростить для слабых учеников и усложнить для сильных; инклюзивные правки",
  "digital_tools": "Бесплатные цифровые инструменты если нужны (Wordwall, Kahoot, Genially, LearningApps) или пустая строка если не нужны",
  "teacher_tips": [
    "Лайфхак 1 — как удержать внимание",
    "Лайфхак 2 — что делать при хаосе",
    "Лайфхак 3 — как быстро проверить ответы",
    "Лайфхак 4 — дополнительный совет"
  ],
  "variations": "Как упростить или усложнить игру целиком"
}}

Требования:
- Игра безопасная, возраст-адекватная для {grade}
- Все game_materials готовы к копированию и печати прямо сейчас
- Укладывается ровно в {duration}
- Работает при технических возможностях: {tech}
- Язык простой — инструкция работает даже у учителя без опыта геймификации"""

    request_body = json.dumps({
        'model': MODEL,
        'messages': [
            {'role': 'system', 'content': 'Ты профессиональный педагог-методист с 20-летним опытом геймификации. Создаёшь детальные, готовые к использованию образовательные игры. Отвечаешь только валидным JSON без markdown-блоков.'},
            {'role': 'user', 'content': prompt}
        ],
        'temperature': 0.8,
        'max_tokens': 3500,
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
    with urllib.request.urlopen(req, timeout=90) as response:
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
