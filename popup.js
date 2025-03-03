document.getElementById("applyStyles").addEventListener("click", () => { 
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = new URL(tabs[0].url);
        const domain = url.hostname;

        chrome.storage.sync.get(domain + "_default", (data) => {
            if (!data[domain + "_default"]) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: getOriginalStyles
                }, (result) => {
                    if (result && result[0]) {
                        chrome.storage.sync.set({ [domain + "_default"]: result[0] });
                    }
                });
            }
        });

        const styles = {
            font: document.getElementById("fontSelector").value,
            fontSize: document.getElementById("fontSizeSelector").value + "px",
            textColor: document.getElementById("textColorPicker").value,
            bgColor: document.getElementById("bgColorPicker").value
        };

        chrome.storage.sync.set({ [domain]: styles });

        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: applyStyles,
            args: [styles]
        });
    });
});

document.getElementById("resetStyles").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = new URL(tabs[0].url);
        const domain = url.hostname;

        chrome.storage.sync.get(domain + "_default", (data) => {
            if (data[domain + "_default"]) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: applyStyles,
                    args: [data[domain + "_default"]]
                });

                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: removeCustomStyles
                });

                chrome.storage.sync.remove(domain);
            }
        });
    });
});

function getOriginalStyles() {
    const bodyStyles = window.getComputedStyle(document.body);
    return {
        font: bodyStyles.fontFamily,
        fontSize: bodyStyles.fontSize,
        textColor: bodyStyles.color,
        bgColor: bodyStyles.backgroundColor
    };
}

function applyStyles(styles) {
    let styleTag = document.getElementById("custom-style");
    if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "custom-style";
        document.documentElement.appendChild(styleTag);
    }

    styleTag.innerHTML = `
        body, * {
            font-family: ${styles.font} !important;
            font-size: ${styles.fontSize} !important;
            color: ${styles.textColor} !important;
            background-color: ${styles.bgColor} !important;
        }
        img, video, picture, svg {
            background-color: transparent !important;
            mix-blend-mode: normal !important;
        }
    `;
}

function removeCustomStyles() {
    const styleTag = document.getElementById("custom-style");
    if (styleTag) {
        styleTag.remove();
    }
}
