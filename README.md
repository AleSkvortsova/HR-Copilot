# HR-Copilot

**HR-Copilot** — твой второй пилот при поиске работы и подготовке к собеседованию на каждом этапе.

Локальный веб-сервис на Flask, который помогает адаптировать резюме, подготовить сопроводительное письмо, самопрезентацию и ответы на вопросы для собеседования с помощью OpenAI.

## Технический стек

- **Backend** — Python 3, [Flask](https://flask.palletsprojects.com/) 3
- **ИИ** — [OpenAI API](https://platform.openai.com/) (по умолчанию `gpt-4o-mini`)
- **Парсинг файлов** — [pypdf](https://pypi.org/project/pypdf/) (PDF), [python-docx](https://python-docx.readthedocs.io/) (Word)
- **Конфигурация** — [python-dotenv](https://pypi.org/project/python-dotenv/) (переменные из `.env`)
- **Frontend** — HTML (Jinja2-шаблоны), CSS, vanilla JavaScript
- **UI** — шрифт [Manrope](https://fonts.google.com/specimen/Manrope), [marked](https://marked.js.org/) для рендера Markdown в ответах

Зависимости перечислены в `requirements.txt`. Для production-деплоя обычно добавляют WSGI-сервер [Gunicorn](https://gunicorn.org/).

## Возможности

- **Резюме** — рекомендации по улучшению резюме под должность или вакансию.
- **Сопроводительное письмо** — короткое письмо для отклика с возможностью редактирования и копирования.
- **Самопрезентация** — ответ на вопрос «Расскажите о себе» в структуре «Настоящее → Прошлое → Будущее».
- **Классические вопросы** — подготовка ответов на типовые вопросы интервью, включая STAR, вопрос про слабость и смену работы.
- **5 возможных вопросов** — прогноз вопросов по конкретной вакансии и пример сильного ответа по STAR.
- **Вопрос о зарплате** — запланированный сервис.

## Ввод данных

Обязательные поля для запуска любого сценария:

- резюме в формате PDF или `.docx`;
- название должности.

Дополнительные поля:

- данные о компании;
- описание вакансии.

Эти поля не обязательны, но помогают сделать ответы точнее. Если они не заполнены, приложение покажет предупреждение и предложит либо вернуться к заполнению, либо продолжить генерацию как есть.

## Запуск

1. Создайте виртуальное окружение и установите зависимости:

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2. Скопируйте `.env.example` в `.env` и укажите ключ OpenAI:

```powershell
copy .env.example .env
```

В файле `.env`:

```env
OPENAI_API_KEY=ваш_ключ
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.45
OPENAI_TOP_P=1
OPENAI_MAX_TOKENS=2000
```

3. Запустите приложение:

```powershell
python app.py
```

4. Откройте в браузере: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## API

Основные маршруты:

- `POST /api/improve-resume` — рекомендации по резюме.
- `POST /api/cover-letter` — сопроводительное письмо.
- `POST /api/self-presentation` — самопрезентация.
- `POST /api/vacancy-questions` — вероятные вопросы по вакансии.
- `POST /api/interview-answer` — ответы на классические вопросы.

## Структура проекта

```
HR-Copilot/
├── app.py                    # Flask-приложение и API
├── config.py                 # настройки окружения
├── services/
│   ├── openai_service.py     # промпты и запросы к OpenAI
│   ├── resume_parser.py      # извлечение текста из PDF/.docx
│   └── vacancy_parser.py     # сбор данных о вакансии
├── templates/                # HTML-шаблоны
├── static/
│   ├── css/style.css         # стили интерфейса
│   └── js/main.js            # клиентская логика
└── uploads/                  # временные файлы резюме
```
