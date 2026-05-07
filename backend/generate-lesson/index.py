import json
import os
import urllib.request
import re


API_URL = "https://api.aitunnel.ru/v1/chat/completions"
MODEL = "gpt-4o-mini"


def handler(event: dict, context) -> dict:
    """Генерирует подробный план-конспект урока по расширенному педагогическому промту."""

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
    topic = body.get('topic', '')
    lesson_format = body.get('lesson_format', 'очный')
    duration = body.get('duration', '45 мин')
    students_count = body.get('students_count', '25–30')
    goal = body.get('goal', '')
    results_subject = body.get('results_subject', '')
    results_meta = body.get('results_meta', '')
    results_personal = body.get('results_personal', '')
    tech = body.get('tech', 'доска и маркеры')
    group_features = body.get('group_features', '')
    technology = body.get('technology', '')

    prompt = f"""Ты опытный методист с 20-летним стажем. Разработай подробный план-конспект урока.

📌 Параметры урока:
- Предмет/направление: {subject}
- Тема: {topic}
- Возраст/класс: {grade}
- Формат: {lesson_format}
- Длительность: {duration}
- Количество обучающихся: {students_count}
- Цель урока: {goal if goal else f'сформировать понимание темы «{topic}»'}
- Предметные результаты: {results_subject if results_subject else 'знание основных понятий темы'}
- Метапредметные результаты (УУД): {results_meta if results_meta else 'коммуникация, критическое мышление, рефлексия'}
- Личностные результаты: {results_personal if results_personal else 'мотивация к учению, социальная ответственность'}
- Технические возможности: {tech}
- Особенности группы: {group_features if group_features else 'стандартная группа'}
- Технология обучения: {technology if technology else 'смешанная'}

Сгенерируй план-конспект строго в JSON-формате (только JSON, без markdown):
{{
  "title": "Тема урока",
  "lesson_type": "Тип урока (изучение нового / закрепление / комбинированный / контроль)",
  "grade": "{grade}",
  "duration": "{duration}",
  "format": "{lesson_format}",
  "goal": "Педагогическая цель урока",
  "planned_results": {{
    "subject": "Предметные результаты: что узнают / научатся делать",
    "meta": "Метапредметные УУД: коммуникация, критическое мышление, рефлексия",
    "personal": "Личностные: ценности, мотивация, социальная ответственность"
  }},
  "equipment": "Оборудование и материалы (с упоминанием бесплатных цифровых ресурсов если нужны)",
  "interdisciplinary": "Межпредметные связи и интеграция с воспитательной работой",
  "stages": [
    {{
      "name": "Организационный момент",
      "duration": "2–3 мин",
      "goal": "Мотивация и настрой",
      "teacher_actions": "Подробные действия учителя",
      "student_actions": "Действия обучающихся",
      "method": "Приём (конкретный)",
      "materials": "Материалы"
    }},
    {{
      "name": "Актуализация знаний",
      "duration": "5–7 мин",
      "goal": "Проверка базовых знаний",
      "teacher_actions": "Подробные действия учителя + пример вопроса",
      "student_actions": "Действия обучающихся",
      "method": "Приём",
      "materials": "Материалы"
    }},
    {{
      "name": "Изучение нового материала",
      "duration": "10–15 мин",
      "goal": "Освоение нового содержания",
      "teacher_actions": "Подробные действия учителя",
      "student_actions": "Действия обучающихся",
      "method": "Метод + интерактив",
      "materials": "Материалы"
    }},
    {{
      "name": "Первичное закрепление",
      "duration": "7–10 мин",
      "goal": "Отработка нового материала",
      "teacher_actions": "Задание с критериями проверки",
      "student_actions": "Действия обучающихся",
      "method": "Приём",
      "materials": "Материалы"
    }},
    {{
      "name": "Рефлексия",
      "duration": "3–5 мин",
      "goal": "Осмысление результатов урока",
      "teacher_actions": "Конкретный приём рефлексии (незаконченное предложение / светофор / 3-2-1)",
      "student_actions": "Действия обучающихся",
      "method": "Приём рефлексии",
      "materials": "Материалы"
    }},
    {{
      "name": "Домашнее задание",
      "duration": "2–3 мин",
      "goal": "Постановка ДЗ",
      "teacher_actions": "Объяснение ДЗ",
      "student_actions": "Запись ДЗ",
      "method": "Дифференцированное задание",
      "materials": ""
    }}
  ],
  "homework": {{
    "basic": "Базовое задание для всех",
    "advanced": "Повышенное задание для сильных",
    "creative": "Творческое задание по желанию"
  }},
  "adaptation": "Адаптация под разные образовательные потребности: инклюзия, поддержка мотивации, работа с разными темпами",
  "assessment": {{
    "formative": "Формативные критерии оценки (в процессе урока)",
    "summative": "Суммативные критерии оценки (итог)",
    "checklist": ["Пункт самопроверки 1", "Пункт самопроверки 2", "Пункт самопроверки 3", "Пункт самопроверки 4"]
  }},
  "risks": [
    {{"risk": "Риск 1", "solution": "Как быстро исправить"}},
    {{"risk": "Риск 2", "solution": "Как быстро исправить"}},
    {{"risk": "Риск 3", "solution": "Как быстро исправить"}}
  ],
  "handouts": [
    {{"type": "Тип материала (вопрос/карточка/задание/слайд)", "content": "Готовый текст для копирования/печати 1"}},
    {{"type": "Тип материала", "content": "Готовый текст 2"}},
    {{"type": "Тип материала", "content": "Готовый текст 3"}},
    {{"type": "Тип материала", "content": "Готовый текст 4"}}
  ],
  "teacher_tips": ["Лайфхак 1", "Лайфхак 2", "Лайфхак 3"]
}}

Требования:
- Язык простой, инструктивный, без академической воды
- Все задания возраст-адекватные для {grade}
- Упор на активность обучающихся: минимум лекции, максимум практики
- Сумма времени этапов = {duration}
- Цифровые инструменты — только бесплатные и доступные в РФ (Яндекс.Учебник, LearningApps, Wordwall)
- Учти особенности группы: {group_features if group_features else 'стандартная группа'}"""

    request_body = json.dumps({
        'model': MODEL,
        'messages': [
            {'role': 'system', 'content': 'Ты профессиональный методист с 20-летним опытом. Составляешь детальные планы-конспекты уроков. Отвечаешь только валидным JSON без markdown-блоков.'},
            {'role': 'user', 'content': prompt}
        ],
        'temperature': 0.7,
        'max_tokens': 4000,
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

    lesson_plan = json.loads(content)

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True, 'lesson': lesson_plan}, ensure_ascii=False)
    }
