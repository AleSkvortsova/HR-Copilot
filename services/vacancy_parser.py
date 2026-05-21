def build_vacancy_text(
    title: str = "",
    company_name: str = "",
    description: str = "",
) -> str | None:
    """Собирает текст вакансии из полей, введённых пользователем."""
    title = title.strip()
    company_name = company_name.strip()
    description = description.strip()

    if not any((title, company_name, description)):
        return None

    parts = []
    if title:
        parts.append(f"Название должности: {title}")
    if company_name:
        parts.append(f"Название компании, сайт, сфера деятельности: {company_name}")
    if description:
        parts.append(f"Описание вакансии:\n{description}")

    return "\n\n".join(parts)
