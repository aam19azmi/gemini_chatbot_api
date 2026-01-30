document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const loaderContainer = document.getElementById('loader-container');
    const errorContainer = document.getElementById('error-container');
    const copyErrorBtn = document.getElementById('copy-error-btn');

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        addMessageToChatBox('user', userMessage);
        userInput.value = '';
        loaderContainer.style.display = 'block';
        errorContainer.style.display = 'none';

        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversation: [{ role: 'user', content: userMessage }] }),
            });

            if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

            const data = await response.json();
            if (data.result) {
                addMessageToChatBox('bot', formatBotMessage(data.result));
            } else {
                addMessageToChatBox('bot', 'Sorry, no response received.');
            }
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = error.message;
            errorContainer.querySelector('.error-message').textContent = errorMessage;
            errorContainer.style.display = 'block';
            copyErrorBtn.onclick = () => copyToClipboard(errorMessage);
        } finally {
            loaderContainer.style.display = 'none';
        }
    });

    function formatBotMessage(text) {
        text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        const lines = text.split('\n');
        let html = '';
        let inList = false;
        for (const line of lines) {
            if (line.startsWith('### ')) html += `<h3>${line.substring(4)}</h3>`;
            else if (line.startsWith('## ')) html += `<h2>${line.substring(3)}</h2>`;
            else if (line.startsWith('# ')) html += `<h1>${line.substring(2)}</h1>`;
            else if (line.startsWith('* ')) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += `<li>${line.substring(2)}</li>`;
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (line.trim() !== '') html += `<p>${line}</p>`;
            }
        }
        if (inList) html += '</ul>';
        html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<b><i>$1</i></b>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');
        return html;
    }

    function addMessageToChatBox(role, content) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${role}-message`);
        messageElement.innerHTML = content;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Error message copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy error message: ', err);
        });
    }
});