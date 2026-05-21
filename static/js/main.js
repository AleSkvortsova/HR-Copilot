(function () {
    const form = document.getElementById("resume-form");
    const fileInput = document.getElementById("resume-input");
    const dropzone = document.getElementById("dropzone");
    const fileNameEl = document.getElementById("file-name");
    const submitBtn = document.getElementById("submit-btn");
    const coverLetterBtn = document.getElementById("cover-letter-btn");
    const selfPresentationBtn = document.getElementById("self-presentation-btn");
    const classicQuestionsBtn = document.getElementById("classic-questions-btn");
    const vacancyQuestionsBtn = document.getElementById("vacancy-questions-btn");
    const loadingOverlay = document.getElementById("loading-overlay");
    const loadingText = document.getElementById("loading-text");
    const resultSection = document.getElementById("result-section");
    const resultContent = document.getElementById("result-content");
    const resultMeta = document.getElementById("result-meta");
    const coverLetterSection = document.getElementById("cover-letter-section");
    const coverLetterText = document.getElementById("cover-letter-text");
    const editLetterBtn = document.getElementById("edit-letter-btn");
    const copyLetterBtn = document.getElementById("copy-letter-btn");
    const selfPresentationSection = document.getElementById("self-presentation-section");
    const selfPresentationText = document.getElementById("self-presentation-text");
    const editSelfPresentationBtn = document.getElementById("edit-self-presentation-btn");
    const copySelfPresentationBtn = document.getElementById("copy-self-presentation-btn");
    const classicSection = document.getElementById("classic-section");
    const vacancyQuestionsSection = document.getElementById("vacancy-questions-section");
    const vacancyQuestionsContent = document.getElementById("vacancy-questions-content");
    const toast = document.getElementById("toast");
    const uploadSection = document.getElementById("upload-section");
    const vacancyTitleInput = document.getElementById("vacancy-title");
    const companyNameInput = document.getElementById("company-name");
    const vacancyDescriptionInput = document.getElementById("vacancy-description");
    const optionalFieldsDialog = document.getElementById("optional-fields-dialog");
    const optionalFillBtn = document.getElementById("optional-fill-btn");
    const optionalContinueBtn = document.getElementById("optional-continue-btn");

    let selectedFile = null;
    let letterEditable = false;
    let selfPresentationEditable = false;

    function showToast(message, isSuccess) {
        toast.textContent = message;
        toast.classList.toggle("toast--success", Boolean(isSuccess));
        toast.classList.remove("hidden");
        setTimeout(() => {
            toast.classList.add("hidden");
            toast.classList.remove("toast--success");
        }, 5000);
    }

    function setFile(file) {
        if (!file) return;
        const allowed = [".pdf", ".docx"];
        const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
        if (!allowed.includes(ext)) {
            showToast("Поддерживаются только PDF и .docx");
            return;
        }
        selectedFile = file;
        fileNameEl.textContent = file.name;
        dropzone.classList.add("has-file");
        dropzone.classList.remove("dropzone--error");
    }

    function getResumeFile() {
        return selectedFile || fileInput.files[0] || null;
    }

    function buildFormData() {
        const formData = new FormData();
        formData.append("resume", getResumeFile());

        const vacancyTitle = document.getElementById("vacancy-title").value.trim();
        const companyName = document.getElementById("company-name").value.trim();
        const vacancyDescription = document.getElementById("vacancy-description").value.trim();

        if (vacancyTitle) formData.append("vacancy_title", vacancyTitle);
        if (companyName) formData.append("company_name", companyName);
        if (vacancyDescription) formData.append("vacancy_description", vacancyDescription);

        return formData;
    }

    function clearFieldErrors() {
        dropzone.classList.remove("dropzone--error");
        vacancyTitleInput.classList.remove("field-input--error");
    }

    function scrollToUploadSection() {
        uploadSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function validateRequiredFields() {
        clearFieldErrors();
        const hasResume = Boolean(getResumeFile());
        const hasTitle = Boolean(vacancyTitleInput.value.trim());
        let valid = true;

        if (!hasResume) {
            dropzone.classList.add("dropzone--error");
            valid = false;
        }
        if (!hasTitle) {
            vacancyTitleInput.classList.add("field-input--error");
            valid = false;
        }

        if (!valid) {
            showToast("Загрузите резюме и укажите название должности.");
            scrollToUploadSection();
        }

        return valid;
    }

    function hasOptionalFieldsFilled() {
        return Boolean(companyNameInput.value.trim() && vacancyDescriptionInput.value.trim());
    }

    function confirmOptionalFields() {
        if (hasOptionalFieldsFilled()) {
            return Promise.resolve(true);
        }

        return new Promise((resolve) => {
            optionalFieldsDialog.classList.remove("hidden");

            function cleanup() {
                optionalFieldsDialog.classList.add("hidden");
                optionalFillBtn.removeEventListener("click", onFill);
                optionalContinueBtn.removeEventListener("click", onContinue);
            }

            function onFill() {
                cleanup();
                scrollToUploadSection();
                if (!companyNameInput.value.trim()) {
                    companyNameInput.focus();
                } else {
                    vacancyDescriptionInput.focus();
                }
                resolve(false);
            }

            function onContinue() {
                cleanup();
                resolve(true);
            }

            optionalFillBtn.addEventListener("click", onFill);
            optionalContinueBtn.addEventListener("click", onContinue);
        });
    }

    async function runWithValidation(action) {
        if (!validateRequiredFields()) {
            return;
        }
        const proceed = await confirmOptionalFields();
        if (!proceed) {
            return;
        }
        await action();
    }

    async function runRequiredOnly(action) {
        if (!validateRequiredFields()) {
            return;
        }
        await action();
    }

    vacancyTitleInput.addEventListener("input", () => {
        if (vacancyTitleInput.value.trim()) {
            vacancyTitleInput.classList.remove("field-input--error");
        }
    });

    function setLoading(active, message) {
        if (message) loadingText.textContent = message;
        loadingOverlay.classList.toggle("hidden", !active);
        submitBtn.disabled = active;
        coverLetterBtn.disabled = active;
        selfPresentationBtn.disabled = active;
        classicQuestionsBtn.disabled = active;
        vacancyQuestionsBtn.disabled = active;
    }

    function hideAllResultSections() {
        resultSection.classList.add("hidden");
        coverLetterSection.classList.add("hidden");
        selfPresentationSection.classList.add("hidden");
        classicSection.classList.add("hidden");
        vacancyQuestionsSection.classList.add("hidden");
    }

    function setLetterReadonly(readonly) {
        letterEditable = !readonly;
        coverLetterText.readOnly = readonly;
        coverLetterText.classList.toggle("letter-editor--editable", !readonly);
        editLetterBtn.classList.toggle("btn-icon--active", !readonly);
        const label = readonly ? "Редактировать текст" : "Закончить редактирование";
        editLetterBtn.setAttribute("aria-label", label);
        editLetterBtn.title = label;
    }

    function setSelfPresentationReadonly(readonly) {
        selfPresentationEditable = !readonly;
        selfPresentationText.readOnly = readonly;
        selfPresentationText.classList.toggle("letter-editor--editable", !readonly);
        editSelfPresentationBtn.classList.toggle("btn-icon--active", !readonly);
        const label = readonly ? "Редактировать текст" : "Закончить редактирование";
        editSelfPresentationBtn.setAttribute("aria-label", label);
        editSelfPresentationBtn.title = label;
    }

    async function copyTextToClipboard(textarea, emptyMessage) {
        const text = textarea.value.trim();
        if (!text) {
            showToast(emptyMessage);
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            showToast("Текст скопирован в буфер обмена", true);
        } catch {
            textarea.select();
            document.execCommand("copy");
            showToast("Текст скопирован в буфер обмена", true);
        }
    }

    fileInput.addEventListener("change", () => {
        if (fileInput.files[0]) setFile(fileInput.files[0]);
    });

    ["dragenter", "dragover"].forEach((event) => {
        dropzone.addEventListener(event, (e) => {
            e.preventDefault();
            dropzone.classList.add("dragover");
        });
    });

    ["dragleave", "drop"].forEach((event) => {
        dropzone.addEventListener(event, (e) => {
            e.preventDefault();
            dropzone.classList.remove("dragover");
        });
    });

    dropzone.addEventListener("drop", (e) => {
        const file = e.dataTransfer.files[0];
        if (file) {
            const dt = new DataTransfer();
            dt.items.add(file);
            fileInput.files = dt.files;
            setFile(file);
        }
    });

    editLetterBtn.addEventListener("click", () => {
        if (!coverLetterText.value.trim()) return;
        setLetterReadonly(letterEditable);
        if (!letterEditable) {
            coverLetterText.focus();
        }
    });

    copyLetterBtn.addEventListener("click", () => {
        copyTextToClipboard(coverLetterText, "Нет текста для копирования");
    });

    editSelfPresentationBtn.addEventListener("click", () => {
        if (!selfPresentationText.value.trim()) return;
        setSelfPresentationReadonly(selfPresentationEditable);
        if (!selfPresentationEditable) {
            selfPresentationText.focus();
        }
    });

    copySelfPresentationBtn.addEventListener("click", () => {
        copyTextToClipboard(selfPresentationText, "Нет текста для копирования");
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        await runWithValidation(async () => {
            setLoading(true, "Анализируем резюме…");
            hideAllResultSections();

            try {
                const response = await fetch("/api/improve-resume", {
                    method: "POST",
                    body: buildFormData(),
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Не удалось получить рекомендации");
                }

                resultContent.innerHTML = marked.parse(data.recommendations || "");
                resultMeta.textContent = data.has_vacancy
                    ? "С учётом указанной вакансии"
                    : "Общие рекомендации";
                resultSection.classList.remove("hidden");
                resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
            } catch (err) {
                showToast(err.message || "Произошла ошибка");
            } finally {
                setLoading(false);
            }
        });
    });

    coverLetterBtn.addEventListener("click", async () => {
        await runWithValidation(async () => {
            setLoading(true, "Готовим сопроводительное письмо…");
            hideAllResultSections();

            try {
                const response = await fetch("/api/cover-letter", {
                    method: "POST",
                    body: buildFormData(),
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Не удалось сгенерировать письмо");
                }

                coverLetterText.value = data.letter || "";
                setLetterReadonly(true);
                coverLetterSection.classList.remove("hidden");
                coverLetterSection.scrollIntoView({ behavior: "smooth", block: "start" });
            } catch (err) {
                showToast(err.message || "Произошла ошибка");
            } finally {
                setLoading(false);
            }
        });
    });

    selfPresentationBtn.addEventListener("click", async () => {
        await runWithValidation(async () => {
            setLoading(true, "Готовим самопрезентацию…");
            hideAllResultSections();

            try {
                const response = await fetch("/api/self-presentation", {
                    method: "POST",
                    body: buildFormData(),
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Не удалось сгенерировать самопрезентацию");
                }

                selfPresentationText.value = data.text || "";
                setSelfPresentationReadonly(true);
                selfPresentationSection.classList.remove("hidden");
                selfPresentationSection.scrollIntoView({ behavior: "smooth", block: "start" });
            } catch (err) {
                showToast(err.message || "Произошла ошибка");
            } finally {
                setLoading(false);
            }
        });
    });

    classicQuestionsBtn.addEventListener("click", async () => {
        await runWithValidation(async () => {
            hideAllResultSections();
            classicSection.classList.remove("hidden");
            classicSection.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    vacancyQuestionsBtn.addEventListener("click", async () => {
        await runWithValidation(async () => {
            setLoading(true, "Готовим вопросы по вакансии…");
            hideAllResultSections();

            try {
                const response = await fetch("/api/vacancy-questions", {
                    method: "POST",
                    body: buildFormData(),
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Не удалось сгенерировать вопросы");
                }

                vacancyQuestionsContent.innerHTML = marked.parse(data.questions || "");
                vacancyQuestionsSection.classList.remove("hidden");
                vacancyQuestionsSection.scrollIntoView({ behavior: "smooth", block: "start" });
            } catch (err) {
                showToast(err.message || "Произошла ошибка");
            } finally {
                setLoading(false);
            }
        });
    });

    document.querySelectorAll(".classic-question-toggle").forEach((toggle) => {
        toggle.addEventListener("click", async () => {
            const item = toggle.closest(".classic-question");
            const panel = item.querySelector(".classic-question-panel");
            const isOpen = item.classList.contains("classic-question--open");

            if (isOpen) {
                item.classList.remove("classic-question--open");
                panel.classList.add("hidden");
                return;
            }

            await runRequiredOnly(async () => {
                item.classList.add("classic-question--open");
                panel.classList.remove("hidden");

                if (!panel.dataset.initialized) {
                    initializeQuestionPanel(item, panel);
                    panel.dataset.initialized = "true";
                }
            });
        });
    });

    function initializeQuestionPanel(item, panel) {
        const type = item.dataset.questionType;
        const question = item.dataset.question || item.querySelector(".classic-question-toggle span").textContent.trim();

        if (type === "fit") {
            generateFitAnswer(panel);
            return;
        }
        if (type === "star") {
            renderStarFlow(panel, question);
            return;
        }
        if (type === "weakness") {
            renderSingleAnswerFlow(panel, "weakness", question, getWeaknessIntro(), 3, "Каким будет твой ответ?");
            return;
        }
        if (type === "exit") {
            renderSingleAnswerFlow(
                panel,
                "exit",
                question,
                "Важно сформулировать причину ухода честно, но корректно и конструктивно.",
                3,
                "Опиши свой опыт",
            );
        }
    }

    async function generateFitAnswer(panel) {
        panel.innerHTML = "<p class=\"classic-helper\">Готовим ответ под резюме и вакансию…</p>";
        const formData = buildFormData();
        formData.append("answer_type", "fit");

        setLoading(true, "Готовим ответ на классический вопрос…");
        try {
            const data = await postInterviewAnswer(formData);
            panel.innerHTML = `<div class="classic-answer markdown-body">${marked.parse(data.answer || "")}</div>`;
        } catch (err) {
            panel.innerHTML = "";
            showToast(err.message || "Не удалось подготовить ответ");
        } finally {
            setLoading(false);
        }
    }

    function renderStarFlow(panel, question) {
        const steps = [
            { key: "situation", label: "Какие были обстоятельства?" },
            { key: "task", label: "Какая конкретно стояла задача перед тобой?" },
            { key: "action", label: "Что именно ТЫ сделал? Какие шаги предпринял?" },
            { key: "result", label: "Чем все закончилось? Каких конкретных результатов удалось достичь тебе?" },
        ];
        const answers = {};
        let currentStep = 0;

        panel.innerHTML = `
            <p class="classic-helper">Давай подготовим ответ, используя метод STAR (Situation - Task - Action - Result).</p>
            <div class="star-steps"></div>
            <div class="classic-answer markdown-body hidden"></div>
        `;

        const stepsContainer = panel.querySelector(".star-steps");
        const answerContainer = panel.querySelector(".classic-answer");

        function renderStep() {
            const step = steps[currentStep];
            const isLast = currentStep === steps.length - 1;
            stepsContainer.insertAdjacentHTML("beforeend", `
                <div class="star-step" data-step="${step.key}">
                    <label class="field">
                        <span class="field-label">${step.label}</span>
                        <textarea class="field-input field-textarea star-input" rows="3"></textarea>
                    </label>
                    <button type="button" class="btn btn-primary star-next-btn">${isLast ? "Отправить" : "Далее"}</button>
                </div>
            `);

            const stepEl = stepsContainer.lastElementChild;
            const input = stepEl.querySelector(".star-input");
            const button = stepEl.querySelector(".star-next-btn");
            input.focus();

            button.addEventListener("click", async () => {
                const value = input.value.trim();
                if (!value) {
                    showToast("Заполните ответ перед продолжением.");
                    return;
                }

                answers[step.key] = value;
                input.readOnly = true;
                button.disabled = true;

                if (!isLast) {
                    currentStep += 1;
                    renderStep();
                    return;
                }

                await submitStarAnswer(question, answers, answerContainer);
            });
        }

        renderStep();
    }

    async function submitStarAnswer(question, answers, answerContainer) {
        if (!validateRequiredFields()) {
            return;
        }

        const formData = buildFormData();
        formData.append("answer_type", "star");
        formData.append("question", question);
        formData.append("situation", answers.situation);
        formData.append("task", answers.task);
        formData.append("action", answers.action);
        formData.append("result", answers.result);

        setLoading(true, "Структурируем ответ по STAR…");
        try {
            const data = await postInterviewAnswer(formData);
            answerContainer.innerHTML = marked.parse(data.answer || "");
            answerContainer.classList.remove("hidden");
            answerContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } catch (err) {
            showToast(err.message || "Не удалось подготовить ответ");
        } finally {
            setLoading(false);
        }
    }

    function renderSingleAnswerFlow(panel, type, question, intro, rows, label = "Твой черновик ответа") {
        panel.innerHTML = `
            <p class="classic-helper">${intro}</p>
            <label class="field">
                <span class="field-label">${label}</span>
                <textarea class="field-input field-textarea single-answer-input" rows="${rows}"></textarea>
            </label>
            <button type="button" class="btn btn-primary single-answer-submit">Отправить</button>
            <div class="classic-answer markdown-body hidden"></div>
        `;

        const input = panel.querySelector(".single-answer-input");
        const button = panel.querySelector(".single-answer-submit");
        const answerContainer = panel.querySelector(".classic-answer");
        input.focus();

        button.addEventListener("click", async () => {
            const value = input.value.trim();
            if (!value) {
                showToast("Заполните ответ перед отправкой.");
                return;
            }

            if (!validateRequiredFields()) {
                return;
            }

            const formData = buildFormData();
            formData.append("answer_type", type);
            formData.append("question", question);
            formData.append("user_answer", value);

            setLoading(true, "Готовим формулировку ответа…");
            try {
                const data = await postInterviewAnswer(formData);
                answerContainer.innerHTML = marked.parse(data.answer || "");
                answerContainer.classList.remove("hidden");
                answerContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
            } catch (err) {
                showToast(err.message || "Не удалось подготовить ответ");
            } finally {
                setLoading(false);
            }
        });
    }

    async function postInterviewAnswer(formData) {
        const response = await fetch("/api/interview-answer", {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || "Не удалось подготовить ответ");
        }
        return data;
    }

    function getWeaknessIntro() {
        return `Мы уже давно все прочитали, что это ошибка — воспринимать этот вопрос буквально, а рекрутеры продолжают его задавать и регулярно получать в ответ признания, которые могут поставить крест на твоей кандидатуре. Каким должен быть “правильный” ответ? Точно не таким: “моя слабость в том, что я перфекционист”. Мы все не идеальны и рекрутеры (почти все) это понимают, поэтому отвечать нужно с адекватным уровнем самокритики и готовностью работать над своими недостатками.`;
    }
})();
