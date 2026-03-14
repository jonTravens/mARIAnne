/**
 * playground.js
 *
 * Gère deux responsabilités :
 * 1. Boutons "Copier" — copie le contenu du bloc code adjacent
 * 2. Playground interactif — les contrôles modifient les attributs du composant en live
 *
 * Le rendu initial des composants est fait server-side (Astro).
 * Ce script ne re-rend jamais le DOM complet — il modifie uniquement les attributs.
 */

// ── Boutons Copier ──────────────────────────────────────────────────────────

document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
        var codeEl = btn.closest('.code-block') && btn.closest('.code-block').querySelector('code');
        if (!codeEl) return;

        var text = codeEl.textContent || '';
        navigator.clipboard
            .writeText(text)
            .then(function () {
                btn.textContent = 'Copié !';
                btn.classList.add('copied');
                setTimeout(function () {
                    btn.textContent = 'Copier';
                    btn.classList.remove('copied');
                }, 2000);
            })
            .catch(function () {
                var range = document.createRange();
                range.selectNodeContents(codeEl);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
            });
    });
});

// ── Playground interactif ──────────────────────────────────────────────────

document.querySelectorAll('[data-playground]').forEach(function (section) {
    var tagName = section.dataset.tagName;
    var preview = section.querySelector('[data-playground-preview]');
    var controls = section.querySelectorAll('[data-playground-ctrl]');
    var codeEl = section.querySelector('[data-playground-code]');

    if (!preview || !tagName) return;

    // Met à jour l'aperçu du code depuis l'état actuel de l'élément
    function updateCode() {
        if (!codeEl) return;
        var el = preview.querySelector(tagName);
        if (!el) return;
        codeEl.textContent = el.outerHTML;
    }

    // Synchroniser l'état initial des contrôles avec les attributs du composant rendu
    controls.forEach(function (ctrl) {
        var attr = ctrl.dataset.attr;
        if (!attr) return;

        var el = preview.querySelector(tagName);
        if (!el) return;

        if (ctrl.type === 'checkbox') {
            ctrl.checked = el.hasAttribute(attr);
        } else {
            var current = el.getAttribute(attr);
            if (current !== null) ctrl.value = current;
        }
    });

    // Écouter les changements sur les contrôles
    controls.forEach(function (ctrl) {
        var eventName = ctrl.type === 'checkbox' ? 'change' : 'input';
        ctrl.addEventListener(eventName, function () {
            var attr = ctrl.dataset.attr;
            if (!attr) return;

            var el = preview.querySelector(tagName);
            if (!el) return;

            if (ctrl.type === 'checkbox') {
                el.toggleAttribute(attr, ctrl.checked);
            } else if (ctrl.value === '') {
                el.removeAttribute(attr);
            } else {
                el.setAttribute(attr, ctrl.value);
            }

            updateCode();
        });
    });

    // Bouton copier du playground
    var copyBtn = section.querySelector('[data-copy-playground]');
    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            var text = codeEl ? codeEl.textContent || '' : '';
            navigator.clipboard
                .writeText(text)
                .then(function () {
                    copyBtn.textContent = 'Copié !';
                    copyBtn.classList.add('copied');
                    setTimeout(function () {
                        copyBtn.textContent = 'Copier';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                })
                .catch(function () {
                    if (codeEl) {
                        var range = document.createRange();
                        range.selectNodeContents(codeEl);
                        window.getSelection().removeAllRanges();
                        window.getSelection().addRange(range);
                    }
                });
        });
    }
});
