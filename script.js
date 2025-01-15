const messageInput = document.querySelector(".message-input");
const chatBody = document.querySelector(".chat-body");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelBtn = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");
const clearChat = document.querySelector("#clear-chat");
const suggestions = document.querySelectorAll(".suggestion");

//API setup
const API_KEY = `AIzaSyBXQd4YE2GBSgWsAaW9nnhLp7tWJua3udQ`;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

//user data message
let userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
};

//chat history varaible
const chatHistory = [];

//Initial height of the message input box
const initialMessageInputHeight = messageInput.scrollHeight;

//Create message element with dynamic classes and return it
const createMessageElement = (messageContent, ...classes) => {
    const div = document.createElement('div');
    div.classList.add("message", "remove-element", ...classes);
    div.innerHTML = messageContent;
    return div;
}

//Generate bot response using Api
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");

    // Add user response to chat history
    chatHistory.push({
        role: "user",
        parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])]
    });

    //Api request options
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: chatHistory
        })
    }

    try {
        // fetch bot request from API
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        // Extract and display bot response text
        const apiResonseText = data.candidates[0].content.parts[0].text.trim();
        messageElement.innerText = apiResonseText;

        // Add bot response to chat history
        chatHistory.push({
            role: "model",
            parts: [{ text: apiResonseText }]
        });
    } catch (error) {
        // handle erroe in API response
        messageElement.innerText = error.message;
        messageElement.style.color = "red";
    }
    finally {
        //reset user data, remove thinking indicator and scroll to bottom
        userData.file = {};
        incomingMessageDiv.classList.remove("thinking-indicator");
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    }
}

//handle outgoing user messages
const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";


    // Remove file attachment after sending message
    fileUploadWrapper.classList.remove("file-uploaded");

    messageInput.dispatchEvent(new Event("input"));

    //Create and display user message
    const messageContent = `${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" alt="file" class="attachment">` : ""}
                            <div class="message-text"></div>`;

    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").innerText = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    // stimulate bot response with thinking indicator after a delay
    setTimeout(() => {
        const messageContent = ` <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 1024 1024">
                    <path
                        d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z">
                    </path>
                </svg>
                <div class="message-text">
                    <div class="thinking-indicator">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div> `;

        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking-indicator");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        generateBotResponse(incomingMessageDiv);
    }, 600);
}


//handle Enter key press for sending messages
messageInput.addEventListener("keydown", (e) => {
    const userMessage = messageInput.value.trim();
    if (e.key === "Enter" && userMessage && !e.shiftKey && window.innerWidth > 768) {
        handleOutgoingMessage(e);
    }
});

// height of message input box changes dyancmically with input
messageInput.addEventListener("input", () => {
    messageInput.style.height = initialMessageInputHeight + "px";
    messageInput.style.height = messageInput.scrollHeight + "px";
    document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight >
        initialMessageInputHeight ? "15px" : "32px";
});

// handle file input change
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        fileUploadWrapper.querySelector("img").src = e.target.result;
        fileUploadWrapper.classList.add("file-uploaded");
        const base64String = e.target.result.split(",")[1];

        //store the file data in user data
        userData.file = {
            data: base64String,
            mime_type: file.type
        }

        fileInput.value = "";
    }

    reader.readAsDataURL(file);
});

// Cancel file upload
fileCancelBtn.addEventListener("click", () => {
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded");
});

//initialize emoji picker and hadnle emoji selection 
const picker = new EmojiMart.Picker({
    theme: 'light',
    skinTonePosition: 'none',
    previewPosition: 'none',
    onEmojiSelect: (emoji) => {
        const { selectionStart: start, selectionEnd: end } = messageInput;
        messageInput.setRangeText(emoji.native, start, end, 'end');
        messageInput.focus();
    },
    onClickOutside: (e) => {
        if (e.target.id === "emoji-picker" || e.key === "Enter") {
            document.body.classList.toggle("show-emoji-picker");
        } else {
            document.body.classList.remove("show-emoji-picker");
        }

    },
    onkeydownOutside: (e) => {
        if (e.key === "Enter") {
            console.log(key);
            document.body.classList.remove("show-emoji-picker");
        }
    }
});

// opening emoji picker when clicked on emoji icon
document.querySelector(".chat-form").appendChild(picker);

sendMessageButton.addEventListener("click", (e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", (e) => fileInput.click());
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.querySelector(".bg-container").classList.toggle("bg-overlay"));
closeChatbot.addEventListener("click", () => document.body.querySelector(".bg-container").classList.remove("bg-overlay"));
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));

//clear chat history from chat body
clearChat.addEventListener("click", () => {
    chatHistory.length = 0;
    userData = {
        message: null,
        file: {
            data: null,
            mime_type: null
        }
    };
    messageInput.value = "";
    fileUploadWrapper.classList.remove("file-uploaded");
    const removeEelement = document.querySelectorAll(".remove-element");
    removeEelement.forEach(element => element.remove());
});

//handle text suggestion click
suggestions.forEach((suggestion) => {
    suggestion.addEventListener("click", (e) => {
        const h4Element = suggestion.querySelector("h4");
        if (h4Element) {
            const suggestionText = h4Element.innerText.trim();
            document.body.classList.add("show-chatbot");
            document.body.querySelector(".bg-container").classList.add("bg-overlay");
            messageInput.value = suggestionText;
            handleOutgoingMessage(e);
        }
    });
});