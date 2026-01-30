const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

let conversation = [];

const addMessage = (role, text) => {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", `${role}-message`);
  messageElement.innerHTML = `<p>${text}</p>`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
  return messageElement;
};

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  addMessage("user", userMessage);
  conversation.push({ role: "user", text: userMessage });
  userInput.value = "";

  const thinkingMessage = addMessage("bot", "Thinking...");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversation }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get response from server.");
    }

    const data = await response.json();

    if (data.result) {
      thinkingMessage.innerHTML = markdownToHtml(data.result);
      conversation.push({ role: 'model', text: data.result });
    } else {
      thinkingMessage.innerHTML = '<p>Sorry, no response received.</p>';
    }
  } catch (error) {
    console.error('Error:', error);
    thinkingMessage.innerHTML = `<p>${error.message}</p>`;
  }
});

function markdownToHtml(text) {
  const lines = text.split('\n');
  let newLines = [];
  let inList = false;

  for (const line of lines) {
    if (line.startsWith('* ')) {
      if (!inList) {
        newLines.push('<ul>');
        inList = true;
      }
      newLines.push(`<li>${line.substring(2)}</li>`);
    } else {
      if (inList) {
        newLines.push('</ul>');
        inList = false;
      }
      newLines.push(line);
    }
  }

  if (inList) {
    newLines.push('</ul>');
  }

  return newLines.join('')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\n/g, '<br>')
    .replace(/<\/ul><br>/g, '</ul>')
    .replace(/<\/li><br>/g, '<\/li>')
    .replace(/<h3>(.*?)<\/h3><br>/g, '<h3>$1</h3>');
}


