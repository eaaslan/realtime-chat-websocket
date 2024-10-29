'use strict';

const userNamePage = document.querySelector("#username-page");
const chatPage = document.querySelector("#chat-page");
const usernameForm = document.querySelector("#userNameForm");
const messageForm = document.querySelector("#messageForm");
const messageInput = document.querySelector("#message");
const messageArea = document.querySelector("#messageArea");
let username = null;
let stompClient = null;

usernameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    connect();
});

// Event listener for sending messages
messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage();
});

// Append received message to message area
function appendMessage(content) {
    messageArea.insertAdjacentHTML("beforeend", `<li>${content}</li>`);
}

// Handle received messages
function onMessageReceived(payload) {
    let message = JSON.parse(payload.body);

    if (message.type === 'JOIN' && message.sender === username) {
        return
    }

    if (message.type === 'JOIN') {
        appendMessage(`${message.sender} joined!`);
    } else if (message.type === 'LEAVE') {
        appendMessage(`${message.sender} left!`);
    } else {
        appendMessage(`${message.sender}: ${message.content}`);
    }
}

// Send message to the server
function sendMessage() {
    let messageContent = messageInput.value.trim();

    if (messageContent && stompClient) {
        let chatMessage = {
            sender: username,
            content: messageContent,
            type: 'CHAT'
        };

        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
}

// Handle successful connection
function onConnected() {
    userNamePage.classList.add("disable");
    chatPage.classList.remove("disable");

    stompClient.subscribe("/topic/public", onMessageReceived);

    // Notify the server that the user has joined
    stompClient.send("/app/chat.addUser", {}, JSON.stringify({
        sender: username,
        type: 'JOIN',
    }));
}

// Handle connection errors
function onError() {
    console.error("Connection error");
}

// Connect to the WebSocket server
const connect = () => {
    username = document.querySelector("#name").value.trim();

    if (username) {
        const socket = new SockJS('http://localhost:8080/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
};
