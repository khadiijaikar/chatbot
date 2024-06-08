document.addEventListener("DOMContentLoaded", function() {
    const chatDisplay = document.getElementById("chat-display");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");
  
    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        sendMessage();
      }
    });
  
    function getCurrentDate() {
      const currentDate = new Date();
      const options = { year: "numeric", month: "long", day: "numeric" };
      return currentDate.toLocaleDateString("en-US", options);
    }
  
    function displayDate() {
      const chatDate = document.getElementById("chat-date");
      chatDate.textContent = getCurrentDate();
    }
  
    displayDate();
  
    function sendMessage() {
      const message = userInput.value.trim();
      if (message === "") return;
  
      appendMessage("user", message);
      userInput.value = "";
  
      fetch("http://localhost:5005/webhooks/rest/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sender: "user",
          message: message
        })
      })
        .then(response => response.json())
        .then(data => {
          data.forEach(response => {
            appendMessage("bot", response.text);
          });
        })
        .catch(error => console.error("Error:", error));
    }
  
    function appendMessage(sender, message) {
        const messageElement = document.createElement("div");
        messageElement.classList.add(sender);
      
        if (sender === "bot") {
          const botImage = document.createElement("img");
          botImage.src = "/images/triggre_logo2.png";
          messageElement.appendChild(botImage);
        }
      
        const messageContainer = document.createElement("div");
        messageContainer.classList.add("message-container");
        messageContainer.textContent = message;
        messageElement.appendChild(messageContainer);
      
        if (sender === "user") {
          const timestamp = document.createElement("span");
          timestamp.classList.add("timestamp");
          timestamp.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          messageElement.appendChild(timestamp);
        }
      
        chatDisplay.appendChild(messageElement);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
      }
  });
  
  document.getElementById('chatbot-icon').addEventListener('click', function(event) {
    event.stopPropagation();
    document.getElementById('chatbot-popup').style.display = 'block';
    document.getElementById('chatbot-icon').style.display = 'none';
  });
  
  document.getElementById('close-button').onclick = function() {
    let chatbotPopup = document.getElementById('chatbot-popup');
    chatbotPopup.style.display = 'none';
    document.getElementById('chatbot-icon').style.display = 'block';
  };
  