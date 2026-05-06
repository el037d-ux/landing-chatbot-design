import json
import os
import urllib.request
import re


API_URL = "https://api.aitunnel.ru/v1/chat/completions"
MODEL = "gpt-4o-mini"


def handler(event: dict, context) -> dict:
    """Генерирует технологическую карту урока по профессиональной педагогической структуре."""

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
    group_features = body.get('group_features', '')
    topic = body.get('topic', '')
    goal = body.get('goal', '')
    tasks = body.get('tasks', '')
    equipment = body.get('equipment', '')
    technology = body.get('technology', '')
    duration = body.get('duration', '45 мин')

    prompt = f"""Ты опытный методист с 20-летним стажем. Составь подробную технологическую карту урока по следующим данным:

- Предмет: {subject}
- Класс: {grade}
- Особенности группы: {group_features}
- Тема урока: {topic}
- Длительность: {duration}
- Цель урока: {goal}
- Задачи: {tasks}
- Методическое и техническое оснащение: {equipment}
- Технология обучения: {technology}

Обязательно учти особенности группы ({group_features}) при описании действий учителя и учеников на каждом этапе.

Сгенерируй технологическую карту строго в JSON-формате (только JSON, без markdown-блоков):
{{
  "title": "{topic}",
  "grade": "{grade}",
  "duration": "{duration}",
  "goal": "Уточнённая цель урока",
  "tasks": {{
    "educational": "Образовательные задачи",
    "developmental": "Развивающие задачи",
    "upbringing": "Воспитательные задачи"
  }},
  "equipment": "Методическое и техническое оснащение",
  "technology": "{technology}",
  "organizational_moment": {{
    "name": "Организационный момент",
    "duration": "2-3 мин",
    "teacher_actions": "Подробные действия учителя",
    "student_actions": "Действия учеников",
    "method": "Метод/приём",
    "materials": "Материалы"
  }},
  "topic_actualization": {{
    "name": "Актуализация темы",
    "duration": "5-7 мин",
    "teacher_actions": "Подробные действия учителя",
    "student_actions": "Действия учеников",
    "method": "Метод/приём",
    "materials": "Материалы"
  }},
  "new_topic": {{
    "name": "Сообщение новой темы",
    "duration": "10-15 мин",
    "teacher_actions": "Подробные действия учителя",
    "student_actions": "Действия учеников",
    "method": "Метод/приём",
    "materials": "Материалы"
  }},
  "practical_work": {{
    "name": "Выполнение практической работы",
    "duration": "15-20 мин",
    "teacher_actions": "Подробные действия учителя",
    "student_actions": "Действия учеников",
    "method": "Метод/приём",
    "materials": "Материалы"
  }},
  "consolidation": {{
    "name": "Закрепление изученной темы",
    "duration": "5-7 мин",
    "teacher_actions": "Подробные действия учителя",
    "student_actions": "Действия учеников",
    "method": "Метод/приём",
    "materials": "Материалы"
  }},
  "reflection": {{
    "name": "Рефлексия",
    "duration": "3-5 мин",
    "teacher_actions": "Подробные действия учителя",
    "student_actions": "Действия учеников",
    "method": "Метод/приём",
    "materials": "Материалы"
  }},
  "homework": "Домашнее задание"
}}

Сумма времени всех этапов должна точно соответствовать {duration}. Описания действий — конкретные, практичные, профессиональные."""

    request_body = json.dumps({
        'model': MODEL,
        'messages': [
            {'role': 'system', 'content': 'Ты профессиональный методист и педагог с 20-летним опытом. Составляешь технологические карты уроков. Отвечаешь только валидным JSON без markdown-блоков и без пояснений.'},
            {'role': 'user', 'content': prompt}
        ],
        'temperature': 0.7,
        'max_tokens': 3000,
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

    lesson_plan = json.loads(content)

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True, 'lesson': lesson_plan}, ensure_ascii=False)
    }