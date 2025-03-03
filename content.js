const domain = window.location.hostname;
function applyStyles(styles) {
    if (!styles) return;

    let styleTag = document.getElementById("custom-style");
    if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "custom-style";
        document.documentElement.appendChild(styleTag);
    }

    styleTag.textContent = `
        body, * {
            font-family: ${styles.font || "inherit"} !important;
            font-size: ${styles.fontSize || "inherit"} !important;
            color: ${styles.textColor} !important;
            background-color: ${styles.bgColor} !important;
        }
        img, video, picture, svg {
            background-color: transparent !important;
            mix-blend-mode: normal !important;
        }
    `;

    document.querySelectorAll("*").forEach((el) => {
        if (el.shadowRoot) {
            let shadowStyle = el.shadowRoot.getElementById("shadow-style");
            if (!shadowStyle) {
                shadowStyle = document.createElement("style");
                shadowStyle.id = "shadow-style";
                el.shadowRoot.appendChild(shadowStyle);
            }
            shadowStyle.textContent = styleTag.textContent;
        }
    });
}

function loadStyles() {
    chrome.storage.sync.get(domain, (data) => {
        if (data[domain]) {
            applyStyles(data[domain]);
        }
    });
}

loadStyles();

let timeout;
const observer = new MutationObserver(() => {
    clearTimeout(timeout);
    timeout = setTimeout(loadStyles, 300); 
});
observer.observe(document.body, { childList: true, subtree: true });
