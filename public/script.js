document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userMessage = userInput.value.trim();
        if (!userMessage) {
            return;
        }

        // Add user message to chat box
        addMessageToChatBox('user', userMessage);

        // Show "Thinking..." message
        const thinkingMessageElement = addMessageToChatBox('bot', 'Thinking...');

        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversation: [{ role: 'user', content: userMessage }],
                }),
            });

            if (!response.ok) {
                thinkingMessageElement.textContent = 'Failed to get response from server.';
                return;
            }

            const data = await response.json();

            if (data.result) {
                thinkingMessageElement.innerHTML = formatBotMessage(data.result);
            } else {
                thinkingMessageElement.textContent = 'Sorry, no response received.';
            }
        } catch (error) {
            console.error('Error:', error);
            thinkingMessageElement.textContent = 'Failed to get response from server.';
        } finally {
            userInput.value = '';
        }
    });

    function formatBotMessage(text) {
        const lines = text.split('\n');
        let html = '';
        let inList = false;

        for (const line of lines) {
            if (line.startsWith('### ')) {
                html += '<h3>' + line.substring(4) + '</h3>';
            } else if (line.startsWith('## ')) {
                html += '<h2>' + line.substring(3) + '</h2>';
            } else if (line.startsWith('# ')) {
                html += '<h1>' + line.substring(2) + '</h1>';
            } else if (line.startsWith('* ')) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += '<li>' + line.substring(2) + '</li>';
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (line.trim() !== '') {
                    html += '<p>' + line + '</p>';
                }
            }
        }

        if (inList) {
            html += '</ul>';
        }

        // Bold and Italic (***text***)
        html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<b><i>$1</i></b>');

        // Bold (**text**)
        html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

        // Italic (*text*)
        html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');

        return html;
    }

    function addMessageToChatBox(role, content) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${role}-message`);
        messageElement.textContent = content;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
        return messageElement;
    }
});