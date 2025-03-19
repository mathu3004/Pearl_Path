document.addEventListener("DOMContentLoaded", () => {
    let widget = document.getElementById("widget");
    let chatbox = document.getElementById("chatbox");
    let isDragging = false, offsetX, offsetY;
    let inputField = document.getElementById("userInput");

    // Make Widget Draggable
    widget.addEventListener("mousedown", (e) => {
        if (chatbox.style.display === "block") return;
        isDragging = true;
        offsetX = e.clientX - widget.getBoundingClientRect().left;
        offsetY = e.clientY - widget.getBoundingClientRect().top;
        widget.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        widget.style.left = `${e.clientX - offsetX}px`;
        widget.style.top = `${e.clientY - offsetY}px`;
        widget.style.position = "fixed";
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        widget.style.cursor = "grab";
    });

    // Toggle Chat Box
    widget.addEventListener("click", toggleChat);
    function toggleChat() {
        chatbox.style.display = chatbox.style.display === "block" ? "none" : "block";
    }

    // Send Message on Button Click or Enter Key Press
    function sendMessage() {
        let message = inputField.value.trim();
        if (message === "") return;

        let chatContainer = document.getElementById("chat");

        // User Message
        let userMessage = document.createElement("div");
        userMessage.classList.add("message", "user-message");
        userMessage.innerText = message;
        chatContainer.appendChild(userMessage);

        // Scroll to Bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Clear Input
        inputField.value = "";

        // Simulated Bot Response
        setTimeout(() => {
            let botMessage = document.createElement("div");
            botMessage.classList.add("message", "bot-message");
            botMessage.innerText = "I'm still learning! 😊";
            chatContainer.appendChild(botMessage);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 1000);
    }

    // Add Event Listener for Enter Key Press
    inputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevent the default action (form submission)
            sendMessage();
        }
    });
});
