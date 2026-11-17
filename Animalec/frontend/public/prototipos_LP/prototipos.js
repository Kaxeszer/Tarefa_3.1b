(function () {
    "use strict";

    const kind = document.body.dataset.kind;
    const view = document.body.dataset.view;
    if (
        (kind !== "sponsor" && kind !== "expert") ||
        (view !== "list" && view !== "form" && view !== "detail")
    ) {
        throw new Error("Página de protótipo inválida.");
    }
    const sponsor = kind === "sponsor";
    const listURL = sponsor ? "sponsors.html" : "experts.html";
    const singular = sponsor ? "patrocinador" : "especialista";
    const key = "animalec.prototipos_LP." + kind + ".v1";
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const content = elementById("content");
    const feedback = elementById("feedback");

    function elementById(elementId) {
        const element = document.getElementById(elementId);
        if (!(element instanceof HTMLElement)) {
            throw new Error("Elemento em falta: " + elementId);
        }
        return element;
    }

    function formControl(form, name) {
        const control = form.elements.namedItem(name);
        if (
            !(
                control instanceof HTMLInputElement ||
                control instanceof HTMLTextAreaElement ||
                control instanceof HTMLSelectElement
            )
        ) {
            throw new Error("Campo em falta: " + name);
        }
        return control;
    }

    function escapeHTML(value) {
        return String(value == null ? "" : value).replace(
            /[&<>"']/g,
            character =>
                ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;"
                }[character])
        );
    }

    function safeURL(value) {
        if (typeof value !== "string") return "";
        try {
            const url = new URL(value);
            return ["https:", "http:"].includes(url.protocol) ? url.href : "";
        } catch {
            return "";
        }
    }

    function validImage(value) {
        return (
            typeof value === "string" &&
            /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value)
        );
    }

    function message(text, error = false) {
        feedback.className = "alert " + (error ? "alert-danger" : "alert-success");
        feedback.textContent = text;
    }

    function showDialog(title, text, type, confirmation = false) {
        const previousFocus = document.activeElement;
        const modal = document.createElement("div");
        modal.className = "modal fade prototype-dialog";
        modal.setAttribute("tabindex", "-1");
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("aria-labelledby", "prototype-dialog-title");
        modal.setAttribute("aria-describedby", "prototype-dialog-text");
        const symbols = {warning: "!", success: "✓", info: "i", error: "×"};
        modal.innerHTML = `<div class="modal-dialog modal-dialog-centered"><div class="modal-content">
      <div class="prototype-dialog-icon prototype-dialog-${type}" aria-hidden="true"><span>${
            symbols[type]
        }</span></div>
      <h2 id="prototype-dialog-title">${escapeHTML(title)}</h2>
      <p id="prototype-dialog-text">${escapeHTML(text)}</p>
      <div class="prototype-dialog-actions">
        <button type="button" class="prototype-dialog-confirm">OK</button>
        ${
            confirmation
                ? '<button type="button" class="prototype-dialog-cancel">Cancelar</button>'
                : ""
        }
      </div>
    </div></div>`;
        const confirmButton = modal.querySelector(".prototype-dialog-confirm");
        const cancelButton = modal.querySelector(".prototype-dialog-cancel");
        if (!(confirmButton instanceof HTMLButtonElement)) {
            throw new Error("Botão de confirmação em falta.");
        }
        document.body.appendChild(modal);
        const dialog = window.jQuery(modal);
        let accepted = false;
        return new Promise(resolve => {
            dialog.one("hidden.bs.modal", () => {
                modal.remove();
                if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
                    previousFocus.focus();
                }
                resolve(accepted);
            });
            dialog.one("shown.bs.modal", () => confirmButton.focus());
            confirmButton.onclick = () => {
                accepted = true;
                dialog.modal("hide");
            };
            if (cancelButton instanceof HTMLButtonElement) {
                cancelButton.onclick = () => dialog.modal("hide");
            }
            dialog.modal("show");
            const backdrop = document.querySelector(".modal-backdrop:last-of-type");
            if (backdrop) backdrop.classList.add("prototype-dialog-backdrop");
        });
    }

    const seeds = sponsor
        ? [
            {
                id: "s1",
                name: "Fundação Natureza",
                website: "https://example.org",
                contact: "fundacao@exemplo.pt",
                animal: "Leão",
                description: "Apoio à conservação e divulgação das espécies.",
                image: ""
            },
            {
                id: "s2",
                name: "EcoVida",
                website: "https://example.com",
                contact: "contacto@ecovida.pt",
                animal: "Tigre",
                description: "Educação ambiental e proteção da vida selvagem.",
                image: ""
            },
            {
                id: "s3",
                name: "Planeta Verde",
                website: "https://example.net",
                contact: "geral@planetaverde.pt",
                animal: "Lobo",
                description: "Projetos de preservação dos habitats naturais.",
                image: ""
            }
        ]
        : [
            {
                id: "e1",
                name: "Dra. Ana Silva",
                specialty: "Felinos",
                institution: "Centro de Investigação",
                contact: "ana@exemplo.pt",
                animal: "Felinos",
                image: ""
            },
            {
                id: "e2",
                name: "Dr. João Costa",
                specialty: "Mamíferos",
                institution: "Universidade Aberta",
                contact: "joao@exemplo.pt",
                animal: "Mamíferos",
                image: ""
            },
            {
                id: "e3",
                name: "Dra. Marta Reis",
                specialty: "Aves",
                institution: "Instituto de Biodiversidade",
                contact: "marta@exemplo.pt",
                animal: "Aves",
                image: ""
            }
        ];

    let records = [];
    let storageReady = true;

    function readStoredRecords() {
        const stored = localStorage.getItem(key);
        if (stored === null) return null;
        const parsed = JSON.parse(stored);
        const fields = ["id", "name", "contact", "animal", "image"].concat(
            sponsor ? ["website", "description"] : ["specialty", "institution"]
        );
        if (
            !Array.isArray(parsed) ||
            !parsed.every(
                record =>
                    record && fields.every(field => typeof record[field] === "string")
            )
        ) {
            throw new Error("Dados inválidos no armazenamento local.");
        }
        return parsed;
    }

    try {
        const stored = readStoredRecords();
        if (stored === null) localStorage.setItem(key, JSON.stringify(seeds));
        records = stored === null ? seeds : stored;
    } catch {
        storageReady = false;
        message(
            "Não foi possível ler o armazenamento local. Verifica as permissões do navegador; os dados existentes não serão substituídos.",
            true
        );
    }

    function refreshRecords() {
        if (!storageReady) {
            message(
                "O armazenamento local está indisponível. Não foi possível guardar a alteração.",
                true
            );
            return false;
        }
        try {
            const stored = readStoredRecords();
            if (stored === null) throw new Error("Armazenamento removido.");
            records = stored;
            return true;
        } catch {
            message(
                "Não foi possível reler os dados. Recarrega a página antes de guardar.",
                true
            );
            return false;
        }
    }

    function persist(next) {
        if (!storageReady) return false;
        try {
            localStorage.setItem(key, JSON.stringify(next));
            records = next;
            return true;
        } catch {
            message(
                "Não foi possível guardar. O armazenamento pode estar cheio; tenta uma imagem mais pequena.",
                true
            );
            return false;
        }
    }

    function link(page, recordId) {
        return kind + "-" + page + ".html?id=" + encodeURIComponent(recordId);
    }

    function imageMarkup(record, large = false) {
        const className = large ? "detail-photo" : "record-image";
        if (validImage(record.image)) {
            return `<img class="${className}" src="${escapeHTML(
                record.image
            )}" alt="${escapeHTML(
                (sponsor ? "Logótipo de " : "Fotografia de ") + record.name
            )}">`;
        }
        return large
            ? `<div class="detail-photo placeholder d-flex align-items-center justify-content-center" role="img" aria-label="${
                sponsor ? "Sem logótipo" : "Sem fotografia"
            }"><i class="fas fa-${
                sponsor ? "heart" : "user-graduate"
            }" aria-hidden="true"></i></div>`
            : "";
    }

    function buttons(record) {
        return `<div class="actions d-flex flex-wrap">
      <a class="btn btn-outline-success" href="${link(
            "form",
            record.id
        )}"><i class="fas fa-edit" aria-hidden="true"></i> EDITAR<span class="sr-only"> ${escapeHTML(
            record.name
        )}</span></a>
      <a class="btn btn-outline-success" href="${link(
            "detail",
            record.id
        )}"><i class="fas fa-search" aria-hidden="true"></i> VER<span class="sr-only"> ${escapeHTML(
            record.name
        )}</span></a>
      <button type="button" class="btn btn-outline-danger" data-remove="${escapeHTML(
            record.id
        )}"><i class="fas fa-trash-alt" aria-hidden="true"></i> REMOVER<span class="sr-only"> ${escapeHTML(
            record.name
        )}</span></button>
    </div>`;
    }

    function renderList() {
        content.innerHTML = `<div class="toolbar d-flex flex-wrap">
      <a class="btn btn-outline-success" href="${kind}-form.html"><i class="fas fa-plus-square" aria-hidden="true"></i> ADICIONAR ${singular.toUpperCase()}</a>
      <a class="btn btn-outline-info" href="/admin"><i class="fas fa-bars" aria-hidden="true"></i> MENU PRINCIPAL</a>
    </div>
    <div class="prototype-table-scroll" role="region" aria-label="Tabela de registos" tabindex="0"><table class="table table-striped">
      <caption class="sr-only">Lista de ${
            sponsor ? "patrocinadores" : "especialistas"
        }</caption>
      <thead class="thead-dark"><tr>
        <th scope="col" aria-sort="none"><button type="button" class="sort" id="sort">NOME <span aria-hidden="true">↕</span><span class="sr-only"> — ordenar por nome</span></button></th>
        ${
            sponsor
                ? '<th scope="col">WEBSITE</th><th scope="col">ANIMAL</th>'
                : '<th scope="col">ESPECIALIDADE</th><th scope="col">ESPÉCIE / FAMÍLIA</th>'
        }
        <th scope="col">CONTACTO</th><th scope="col">AÇÕES</th>
      </tr></thead><tbody id="rows"></tbody>
    </table></div>`;
        const tbody = elementById("rows");
        const sortButton = elementById("sort");
        const sortHeader = sortButton.closest("th");
        let ascending = true;

        function renderRows() {
            tbody.innerHTML = records.length
                ? records
                    .map(
                        record => `<tr>
        <td class="name-cell">${imageMarkup(record)}${escapeHTML(
                            record.name
                        )}</td>
        ${
                            sponsor
                                ? `<td data-label="Website">${
                                    safeURL(record.website)
                                        ? `<a href="${escapeHTML(
                                            safeURL(record.website)
                                        )}" target="_blank" rel="noopener noreferrer">${escapeHTML(
                                            record.website
                                        )}</a>`
                                        : "—"
                                }</td>`
                                : `<td data-label="Especialidade">${escapeHTML(
                                    record.specialty
                                )}</td>`
                        }
        <td data-label="${
                            sponsor ? "Animal" : "Espécie / família"
                        }">${escapeHTML(record.animal)}</td>
        <td data-label="Contacto">${escapeHTML(
                            record.contact
                        )}</td><td>${buttons(record)}</td>
      </tr>`
                    )
                    .join("")
                : '<tr><td colspan="5">Ainda não existem registos. Usa o botão Adicionar para começar.</td></tr>';
        }

        renderRows();
        sortButton.onclick = () => {
            records.sort(
                (a, b) => a.name.localeCompare(b.name, "pt") * (ascending ? 1 : -1)
            );
            if (sortHeader)
                sortHeader.setAttribute(
                    "aria-sort",
                    ascending ? "ascending" : "descending"
                );
            ascending = !ascending;
            renderRows();
        };
        let removing = false;
        content.onclick = async event => {
            if (removing) return;
            if (!(event.target instanceof Element)) return;
            const button = event.target.closest("[data-remove]");
            if (!(button instanceof HTMLButtonElement)) return;
            const record = records.find(item => item.id === button.dataset.remove);
            if (!record) return;
            removing = true;
            const label = singular.charAt(0).toUpperCase() + singular.slice(1);
            try {
                const accepted = await showDialog(
                    "Deseja mesmo remover o " + singular + "?",
                    "Se sim, clique em OK",
                    "warning",
                    true
                );
                if (!accepted) {
                    await showDialog("Informação", "Remoção cancelada!", "info");
                    return;
                }
                if (
                    !refreshRecords() ||
                    !persist(records.filter(item => item.id !== record.id))
                ) {
                    await showDialog("Erro", feedback.textContent, "error");
                    return;
                }
                renderRows();
                const result = label + " removido com sucesso.";
                message(result);
                await showDialog(label + " removido!", result, "success");
                const addLink = content.querySelector(".toolbar a");
                if (addLink instanceof HTMLElement) addLink.focus();
            } finally {
                removing = false;
            }
        };
    }

    function missing() {
        content.innerHTML = `<div class="alert alert-warning">Registo não encontrado. Pode ter sido removido.</div><a class="btn btn-outline-info" href="${listURL}">VOLTAR À LISTA</a>`;
    }

    function field(name, label, type = "text", value = "", placeholder = "") {
        return `<div class="form-group">
      <label for="${name}">${label} *</label>
      <input class="form-control" id="${name}" name="${name}" type="${type}" value="${escapeHTML(
            value
        )}" required maxlength="${
            type === "url" ? 500 : 160
        }" placeholder="${escapeHTML(placeholder)}">
    </div>`;
    }

    function renderForm() {
        const current = id ? records.find(record => record.id === id) : null;
        if (id && !current) {
            missing();
            return;
        }
        elementById("title").textContent =
            (id ? "EDITAR " : "ADICIONAR ") + singular.toUpperCase();
        const choices = sponsor
            ? ["Leão", "Tigre", "Lobo", "Girafa", "Elefante", "Sapo", "Macaco"]
            : [
                "Felinos",
                "Mamíferos",
                "Aves",
                "Canídeos",
                "Répteis",
                "Anfíbios",
                "Peixes"
            ];
        const selectedAnimal = current ? current.animal : "";
        if (selectedAnimal && !choices.includes(selectedAnimal))
            choices.push(selectedAnimal);
        const animal = `<div class="form-group">
      <label for="animal">${
            sponsor ? "Animal associado" : "Espécie / família"
        } *</label>
      <select class="form-control" name="animal" id="animal" required><option value="">— Selecionar —</option>
        ${choices
            .map(
                choice =>
                    `<option value="${escapeHTML(choice)}"${
                        selectedAnimal === choice ? " selected" : ""
                    }>${escapeHTML(choice)}</option>`
            )
            .join("")}
      </select>
    </div>`;
        const upload = `<div class="form-group">
      <label for="image">${sponsor ? "Logótipo" : "Fotografia"}</label>
      <input class="form-control" id="image" type="file" accept="image/png,image/jpeg,image/webp" aria-describedby="image-help">
      <small id="image-help" class="text-muted">PNG, JPG ou WebP, até 1 MB. Opcional.</small>
      <div id="image-preview">${
            current && validImage(current.image)
                ? `<img class="preview" src="${escapeHTML(
                    current.image
                )}" alt="Pré-visualização da imagem">`
                : ""
        }</div>
      <label class="d-block mt-2" for="remove-image"><input type="checkbox" id="remove-image"> Remover imagem</label>
    </div>`;
        const name = field("name", "Nome", "text", current ? current.name : "");
        const contact = field(
            "contact",
            "Contacto",
            "text",
            current ? current.contact : "",
            "Email ou telefone"
        );
        content.innerHTML = `<form class="editor border mx-auto" id="record-form">
      <p class="notice text-muted">Os campos assinalados com * são obrigatórios.</p>
      <div class="form-grid">
        ${
            sponsor
                ? name +
                animal +
                field(
                    "website",
                    "Website",
                    "url",
                    current ? current.website : "",
                    "https://exemplo.pt"
                ) +
                contact +
                upload +
                `<div class="form-group wide"><label for="description">Descrição *</label><textarea class="form-control" name="description" id="description" rows="4" required maxlength="2000">${escapeHTML(
                    current ? current.description : ""
                )}</textarea></div>`
                : name +
                field(
                    "specialty",
                    "Especialidade científica",
                    "text",
                    current ? current.specialty : ""
                ) +
                field(
                    "institution",
                    "Instituição",
                    "text",
                    current ? current.institution : ""
                ) +
                animal +
                contact +
                upload
        }
      </div>
      <div class="toolbar form-actions d-flex flex-wrap">
        <button class="btn btn-outline-success" type="submit" id="save"><i class="fas fa-save" aria-hidden="true"></i> GUARDAR</button>
        <a class="btn btn-outline-info" href="${listURL}">CANCELAR</a>
        <a class="btn btn-outline-info" href="/admin">MENU PRINCIPAL</a>
      </div>
    </form>`;
        const form = elementById("record-form");
        const fileInput = elementById("image");
        const preview = elementById("image-preview");
        const save = elementById("save");
        const remove = elementById("remove-image");
        if (
            !(
                form instanceof HTMLFormElement &&
                fileInput instanceof HTMLInputElement &&
                save instanceof HTMLButtonElement &&
                remove instanceof HTMLInputElement
            )
        ) {
            throw new Error("Estrutura do formulário inválida.");
        }
        let imageValue = current && validImage(current.image) ? current.image : "";
        let imageVersion = 0;
        let readingImage = false;
        remove.onchange = () => {
            fileInput.disabled = remove.checked;
            preview.hidden = remove.checked;
            save.disabled = readingImage && !remove.checked;
        };
        fileInput.onchange = () => {
            const version = ++imageVersion;
            const file = fileInput.files ? fileInput.files.item(0) : null;
            fileInput.setCustomValidity("");
            readingImage = false;
            save.disabled = false;
            if (!file) return;
            if (
                !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
                file.size > 1024 * 1024
            ) {
                fileInput.setCustomValidity(
                    "Seleciona uma imagem PNG, JPG ou WebP até 1 MB."
                );
                fileInput.reportValidity();
                return;
            }
            readingImage = true;
            save.disabled = true;

            function finishRead(error = "") {
                if (version !== imageVersion) return;
                readingImage = false;
                save.disabled = false;
                fileInput.setCustomValidity(error);
                if (error) fileInput.reportValidity();
            }

            const reader = new FileReader();
            reader.onload = () => {
                if (version !== imageVersion) return;
                const result = reader.result;
                if (typeof result !== "string" || !validImage(result)) {
                    finishRead("Não foi possível ler a imagem.");
                    return;
                }
                const image = new Image();
                image.onload = () => {
                    if (version !== imageVersion) return;
                    imageValue = result;
                    image.className = "preview";
                    image.alt = "Pré-visualização da imagem";
                    preview.textContent = "";
                    preview.appendChild(image);
                    preview.hidden = remove.checked;
                    finishRead();
                };
                image.onerror = () => finishRead("O ficheiro não é uma imagem válida.");
                image.src = result;
            };
            reader.onerror = () => finishRead("Não foi possível ler a imagem.");
            reader.readAsDataURL(file);
        };
        form.onsubmit = async event => {
            event.preventDefault();
            if (save.disabled || (readingImage && !remove.checked)) return;
            form.querySelectorAll("[name]").forEach(control => {
                if (
                    control instanceof HTMLInputElement ||
                    control instanceof HTMLTextAreaElement ||
                    control instanceof HTMLSelectElement
                ) {
                    control.value = control.value.trim();
                    control.setCustomValidity("");
                }
            });
            const contactInput = formControl(form, "contact");
            if (
                contactInput.value &&
                !(
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInput.value) ||
                    /^[+\d][\d\s().-]{5,24}$/.test(contactInput.value)
                )
            ) {
                contactInput.setCustomValidity("Introduz um email ou telefone válido.");
            }
            if (sponsor) {
                const website = formControl(form, "website");
                if (!safeURL(website.value))
                    website.setCustomValidity(
                        "Introduz um endereço http:// ou https:// válido."
                    );
            }
            if (!form.reportValidity()) return;
            if (!refreshRecords()) {
                await showDialog("Erro", feedback.textContent, "error");
                return;
            }
            if (id && !records.some(record => record.id === id)) {
                message("Este registo foi removido noutro separador.", true);
                await showDialog("Erro", feedback.textContent, "error");
                return;
            }

            const next = {
                id:
                    id ||
                    kind +
                    "-" +
                    Date.now().toString(36) +
                    "-" +
                    Math.random()
                        .toString(36)
                        .slice(2, 8),
                name: formControl(form, "name").value,
                contact: contactInput.value,
                animal: formControl(form, "animal").value,
                image: remove.checked ? "" : imageValue
            };
            if (sponsor) {
                next.website = formControl(form, "website").value;
                next.description = formControl(form, "description").value;
            } else {
                next.specialty = formControl(form, "specialty").value;
                next.institution = formControl(form, "institution").value;
            }
            if (
                persist(
                    id
                        ? records.map(record => (record.id === id ? next : record))
                        : records.concat(next)
                )
            ) {
                save.disabled = true;
                const label = singular.charAt(0).toUpperCase() + singular.slice(1);
                await showDialog(
                    label + (id ? " atualizado!" : " adicionado!"),
                    label + (id ? " atualizado com sucesso." : " adicionado com sucesso."),
                    "success"
                );
                window.location.href = listURL;
            } else {
                await showDialog("Erro", feedback.textContent, "error");
            }
        };
        form.querySelectorAll("[name]").forEach(control => {
            if (
                control instanceof HTMLInputElement ||
                control instanceof HTMLTextAreaElement ||
                control instanceof HTMLSelectElement
            ) {
                control.addEventListener("input", () => control.setCustomValidity(""));
            }
        });
    }

    function renderDetail() {
        const record = records.find(item => item.id === id);
        if (!record) {
            missing();
            return;
        }
        const pairs = sponsor
            ? [
                ["Descrição", record.description],
                ["Website", record.website],
                ["Contacto", record.contact],
                ["Animal associado", record.animal]
            ]
            : [
                ["Especialidade científica", record.specialty],
                ["Instituição", record.institution],
                ["Contacto", record.contact],
                ["Espécie / família", record.animal]
            ];
        content.innerHTML = `<article class="editor border mx-auto">
      <div class="detail">${imageMarkup(
            record,
            true
        )}<div><h2 class="h4">${escapeHTML(record.name)}</h2><dl>
        ${pairs
            .map(
                ([label, value]) =>
                    `<dt>${label}</dt><dd>${
                        label === "Website" && safeURL(value)
                            ? `<a href="${escapeHTML(
                                safeURL(value)
                            )}" target="_blank" rel="noopener noreferrer">${escapeHTML(
                                value
                            )}</a>`
                            : escapeHTML(value || "—")
                    }</dd>`
            )
            .join("")}
      </dl></div></div>
      <div class="toolbar form-actions d-flex flex-wrap">
        <a class="btn btn-outline-success" href="${link(
            "form",
            record.id
        )}"><i class="fas fa-edit" aria-hidden="true"></i> EDITAR</a>
        <a class="btn btn-outline-info" href="${listURL}">VOLTAR À LISTA</a>
        <a class="btn btn-outline-info" href="/admin">MENU PRINCIPAL</a>
      </div>
    </article>`;
        if (params.get("saved") === "1" && storageReady)
            message("Dados guardados com sucesso.");
    }

    if (view === "list") renderList();
    else if (view === "form") renderForm();
    else renderDetail();
})();