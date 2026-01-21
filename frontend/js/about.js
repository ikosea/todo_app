/**
 * About / Feedback Module
 * Simple helpers for copy-to-clipboard and opening links.
 */

export class About {
    static init(windowElement) {
        const copyBtn = windowElement.querySelector('#about-copy-github');
        const handleEl = windowElement.querySelector('#about-github-handle');

        if (copyBtn && handleEl) {
            copyBtn.addEventListener('click', async () => {
                const handle = handleEl.textContent?.trim();
                const text = handle ? `https://github.com/${handle.replace(/^@/, '')}` : '';
                if (!text) return;
                try {
                    await navigator.clipboard.writeText(text);
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => (copyBtn.textContent = 'Copy GitHub'), 1000);
                } catch {
                    // Fallback
                    const temp = document.createElement('textarea');
                    temp.value = text;
                    document.body.appendChild(temp);
                    temp.select();
                    document.execCommand('copy');
                    document.body.removeChild(temp);
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => (copyBtn.textContent = 'Copy GitHub'), 1000);
                }
            });
        }
    }
}


