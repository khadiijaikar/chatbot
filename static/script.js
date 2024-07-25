document.addEventListener("DOMContentLoaded", function() {
  const chatDisplay = document.getElementById("chat-display");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");
  const instructions = document.getElementById("instructions");
  const gform = document.getElementById("gform");
  const triggreIframe = document.getElementById("triggre-iframe");

  let taskTimes = [];
  let taskResponses = [];

  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  });

  function getCurrentDate() {
    const currentDate = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    return currentDate.toLocaleDateString("en-GB", options);
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

    fetch("http://0.0.0.0:5005/webhooks/rest/webhook", {
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

  // Ethical consent form
  let ethical_div = document.createElement("div");
  let ethical_p = document.createElement("p");
  ethical_p.innerHTML = `Please fill out the ethical consent form (the first page of the Google form) before pressing "Start Experiment".`;
  ethical_div.appendChild(ethical_p);
  let start_button = document.createElement("button");
  start_button.innerHTML = "Start Experiment";
  ethical_div.appendChild(start_button);
  instructions.appendChild(ethical_div);

  start_button.addEventListener("click", () => {
    ethical_div.remove();
    triggreIframe.classList.remove("blur"); 
    gform.classList.add("blur");
    let p = document.createElement("p");
    p.innerHTML = `In the centre of the page, you'll find Triggre's forum website featuring an orange chatbot icon located at the bottom. You will be comparing user interactions on both the main website and the forum as part of this user study.\nThere are a total of 6 tasks, each with its own timer and start button. Simply click the start button to begin each task. Once completed, the next task will automatically appear. After finishing all tasks, you may proceed to the Google form.`;
    instructions.appendChild(p);

    addTask(1, "Find the topic 'Table names styling' located in the support category (latest activity April 3rd). Paste the topic description made by @lode.pijpelink.");
  });

  function addTask(taskIndex, description) {
    let existingTaskContainer = document.getElementById(`task-${taskIndex}`);
    if (existingTaskContainer) return;

    let div = document.createElement("div");
    div.id = `task-${taskIndex}`;
    div.classList.add("task-container");

    let desc = document.createElement("p");
    desc.classList.add("task-description"); 
    desc.style.display = "none";
    let strong = document.createElement("strong");
    strong.textContent = `${taskIndex}. ${description}`;
    desc.appendChild(strong);
    div.appendChild(desc);

    let startButton = document.createElement("button");
    startButton.innerHTML = "Start Task";
    startButton.addEventListener("click", () => {
      startButton.style.display = 'none'; 
      desc.style.display = "block"; 
      showTaskContent(taskIndex); 
    });
    div.appendChild(startButton);

    instructions.appendChild(div);
  }

  function showTaskContent(taskIndex) {
    let taskContainer = document.getElementById(`task-${taskIndex}`);
    let taskDescription = taskContainer.querySelector(".task-description");
    let inputField = document.createElement("input");
    inputField.setAttribute("type", "text");
    inputField.setAttribute("placeholder", "Enter your response here");
    inputField.classList.add("task-input");
    taskContainer.appendChild(inputField);

    let timer = document.createElement("p");
    timer.classList.add("timer");
    taskContainer.appendChild(timer);

    let seconds = 0;
    let interval = setInterval(() => {
      seconds++;
      timer.textContent = formatTime(seconds);
    }, 1000);

    let finishButton = document.createElement("button");
    finishButton.innerHTML = "Finish Task";
    finishButton.addEventListener("click", () => {
      clearInterval(interval);
      taskContainer.removeChild(timer);
      taskContainer.removeChild(finishButton);
      taskContainer.removeChild(inputField);

      taskTimes[taskIndex - 1] = seconds; 
      taskResponses[taskIndex - 1] = inputField.value;

      if (taskIndex === 4) {
        refreshTriggreIframe();
      }

      if (taskIndex <= 5) {
        addTask(taskIndex + 1, getTaskDescription(taskIndex + 1));
      } else {
        displaySurveyMessage();
      }
    });
    taskContainer.appendChild(finishButton);
  }

  function getTaskDescription(taskIndex) {
    switch (taskIndex) {
      case 2:
        return "Find and paste the solution to the problem of the previous question, 'Table names styling'.";
      case 3:
        return "Ask the chatbot to find the same topic, such as 'How do I style table names?' Please type this, then copy and paste the most similar topic title + url from the response.";
      case 4:
        return "Use the chatbot to request more details about this topic, such as 'Can you provide the solution to table names styling?' Please type this, then copy and paste the solution below.";
      case 5:
        return "Find the second most recent announcements (last activity Apr 22)). Paste the topic title below.";
      case 6:
        return "Use the chatbot to inquire about the most recent announcements, such as 'What are the latest announcements?' Paste the latest announcement below.";
      default:
        return "";
    }
  }

  function displaySurveyMessage() {
    let surveyMessage = document.createElement("p");
    surveyMessage.textContent = "Congratulations! You have completed all tasks. Please fill in the survey on the right of the screen.";
    instructions.appendChild(surveyMessage);

    let timeSummary = document.createElement("p");
    timeSummary.textContent = "Here are your times for each task:";
    instructions.appendChild(timeSummary);

    taskTimes.forEach((time, index) => {
      let taskSummary = document.createElement("p");
      taskSummary.textContent = `Task ${index + 1}: ${formatTime(time)} - Response: ${taskResponses[index]}`;
      instructions.appendChild(taskSummary);
    });

    gform.classList.remove("blur");
  }

  function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`;
  }

  function refreshTriggreIframe() {
    triggreIframe.src = "static/triggre/index.html";
  }
});
