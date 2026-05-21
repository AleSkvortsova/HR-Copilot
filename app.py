import uuid
from pathlib import Path

from flask import Flask, jsonify, render_template, request

from config import ALLOWED_EXTENSIONS, MAX_CONTENT_LENGTH, SECRET_KEY, UPLOAD_FOLDER
from services.openai_service import (
    analyze_resume,
    generate_cover_letter,
    generate_exit_reason_answer,
    generate_self_presentation,
    generate_vacancy_questions,
    generate_fit_interview_answer,
    generate_star_interview_answer,
    generate_weakness_interview_answer,
)
from services.resume_parser import extract_text_from_resume
from services.vacancy_parser import build_vacancy_text

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH
app.config["SECRET_KEY"] = SECRET_KEY


def _allowed_file(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


def _get_vacancy_fields():
    title = (request.form.get("vacancy_title") or "").strip()
    company_name = (
        request.form.get("company_name")
        or request.form.get("company_url")
        or ""
    ).strip()
    description = (request.form.get("vacancy_description") or "").strip()
    vacancy_text = build_vacancy_text(title, company_name, description)
    return title, company_name, description, vacancy_text


def _validate_required_fields(vacancy_title: str):
    if not vacancy_title:
        raise ValueError("Укажите название должности.")


def _extract_resume_text():
    if "resume" not in request.files:
        raise ValueError("Загрузите резюме в формате PDF или Word (.docx).")

    file = request.files["resume"]
    if not file or not file.filename:
        raise ValueError("Файл резюме не выбран.")

    if not _allowed_file(file.filename):
        raise ValueError("Поддерживаются только файлы PDF и .docx.")

    ext = Path(file.filename).suffix.lower()
    saved_path = UPLOAD_FOLDER / f"{uuid.uuid4().hex}{ext}"
    file.save(saved_path)

    try:
        return extract_text_from_resume(saved_path)
    finally:
        saved_path.unlink(missing_ok=True)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/improve-resume", methods=["POST"])
def improve_resume():
    saved_path = None
    try:
        vacancy_title, company_url, vacancy_description, vacancy_text = _get_vacancy_fields()
        _validate_required_fields(vacancy_title)
        resume_text = _extract_resume_text()
        recommendations = analyze_resume(resume_text, vacancy_text)

        return jsonify({
            "success": True,
            "recommendations": recommendations,
            "has_vacancy": bool(vacancy_text),
        })
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Ошибка при обработке: {exc}"}), 500


@app.route("/api/cover-letter", methods=["POST"])
def cover_letter():
    try:
        vacancy_title, _, _, vacancy_text = _get_vacancy_fields()
        _validate_required_fields(vacancy_title)

        resume_text = _extract_resume_text()
        letter = generate_cover_letter(resume_text, vacancy_text)

        return jsonify({"success": True, "letter": letter})
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Ошибка при обработке: {exc}"}), 500


@app.route("/api/self-presentation", methods=["POST"])
def self_presentation():
    try:
        vacancy_title, _, _, vacancy_text = _get_vacancy_fields()
        _validate_required_fields(vacancy_title)

        resume_text = _extract_resume_text()
        text = generate_self_presentation(resume_text, vacancy_text)

        return jsonify({"success": True, "text": text})
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Ошибка при обработке: {exc}"}), 500


@app.route("/api/vacancy-questions", methods=["POST"])
def vacancy_questions():
    try:
        vacancy_title, _, _, vacancy_text = _get_vacancy_fields()
        _validate_required_fields(vacancy_title)

        resume_text = _extract_resume_text()
        questions = generate_vacancy_questions(resume_text, vacancy_text)

        return jsonify({"success": True, "questions": questions})
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Ошибка при обработке: {exc}"}), 500


@app.route("/api/interview-answer", methods=["POST"])
def interview_answer():
    try:
        vacancy_title, _, _, vacancy_text = _get_vacancy_fields()
        _validate_required_fields(vacancy_title)

        answer_type = (request.form.get("answer_type") or "").strip()
        question = (request.form.get("question") or "").strip()

        if answer_type == "fit":
            resume_text = _extract_resume_text()
            answer = generate_fit_interview_answer(resume_text, vacancy_text)
        elif answer_type == "star":
            situation = (request.form.get("situation") or "").strip()
            task = (request.form.get("task") or "").strip()
            action = (request.form.get("action") or "").strip()
            result = (request.form.get("result") or "").strip()
            if not all((question, situation, task, action, result)):
                raise ValueError("Заполните все ответы по методу STAR.")
            resume_text = _extract_resume_text()
            answer = generate_star_interview_answer(
                question,
                resume_text,
                situation,
                task,
                action,
                result,
            )
        elif answer_type == "weakness":
            user_answer = (request.form.get("user_answer") or "").strip()
            if not user_answer:
                raise ValueError("Заполните ответ перед отправкой.")
            resume_text = _extract_resume_text()
            answer = generate_weakness_interview_answer(
                resume_text,
                vacancy_text,
                user_answer,
            )
        elif answer_type == "exit":
            user_answer = (request.form.get("user_answer") or "").strip()
            if not user_answer:
                raise ValueError("Заполните ответ перед отправкой.")
            answer = generate_exit_reason_answer(user_answer)
        else:
            raise ValueError("Неизвестный тип вопроса.")

        return jsonify({"success": True, "answer": answer})
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Ошибка при обработке: {exc}"}), 500


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
