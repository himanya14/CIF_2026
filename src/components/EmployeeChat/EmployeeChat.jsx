import { useState } from "react";
import ChatMessage from "./ChatMessage";
import { chatScenarios } from "../../data/chatData";
import "../../styles/EmployeeChat.css";
function EmployeeChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();

    const scenario = chatScenarios.find((item) =>
      userMessage.toLowerCase().includes(item.trigger)
    );

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: userMessage,
        isUser: true,
      },
    ]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text:
            scenario?.response ||
            "Your request was processed successfully.",
          isUser: false,
          status: scenario?.status || "allowed",
          label: scenario?.label || "Allowed",
        },
      ]);
    }, 500);

    setInput("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="employee-chat">
      <div className="chat-header">
        <div>
          <h1>Employee AI Assistant</h1>
          <p>Your conversations are protected by AI Watchtower</p>
        </div>

        <div className="security-status">
          <span className="status-dot"></span>
          Protected
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-chat">
            <h2>How can I help you?</h2>
            <p>
              Ask the AI assistant anything. AI Watchtower will
              automatically check your message for security risks.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id}>
            <ChatMessage
              message={message.text}
              isUser={message.isUser}
            />

            {!message.isUser && (
              <div className={`security-badge ${message.status}`}>
                {message.status === "allowed" && "✅"}
                {message.status === "warning" && "⚠️"}
                {message.status === "cleaned" && "🧹"}
                {message.status === "blocked" && "🚫"}

                {" "}
                {message.label}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          placeholder="Message your AI assistant..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}

export default EmployeeChat;