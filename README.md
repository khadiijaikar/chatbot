# Chatbot Project

This project is a Rasa-based chatbot. The following instructions will guide you through setting up and running the chatbot on your local machine.

## Prerequisites

- [Python 3.11+](https://www.python.org/downloads/)
- [Rasa](https://rasa.com/docs/rasa/installation/)
- [Node.js](https://nodejs.org/en/download/) (for the live server)

## Setup Instructions

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/khadiijaikar/chatbot.git
cd chatbot

### 2. Install Dependencies

Ensure you have all necessary dependencies installed. You can use pip to install Rasa:

```bash
pip install rasa

### 3. Unzip and Open the Project
Download and unzip the project files from the provided link. Open the project directory in Visual Studio Code (VS Code).

### 4. Run the Rasa Action Server
Open a terminal in VS Code and run the following command to start the Rasa action server:

```bash
rasa run actions --cors "*"
### 5. Run the Rasa Server
Open a new terminal in VS Code and run the following command to start the Rasa server with API and CORS enabled:

```bash
rasa run --enable-api --cors "*"
Wait for a few moments until you see Rasa server is up and running.

### 6. Start the Live Server
Open the index.html file in the main directory. Click on the "Go Live" button located at the bottom right of the VS Code screen. This will start a live server to host the HTML file.

### 7. Interact with the Chatbot
Once the live server is up and running, you can interact with the chatbot through the web interface.
