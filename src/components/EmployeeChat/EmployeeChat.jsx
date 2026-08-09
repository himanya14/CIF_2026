import { useState } from "react";
import ChatMessage from "./ChatMessage";
import { chatScenarios } from "../../data/chatData";
import "../../styles/EmployeeChat.css";

function EmployeeChat({ onOpenBlockScreen, onBack }) {
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
      let sanitizedText = null;

      // Aadhaar sanitization
      if (scenario?.blockScenarioId === "aadhaar") {
        sanitizedText = userMessage.replace(
          /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
          "[AADHAAR REDACTED]"
        );
      }

      // PAN sanitization
      if (scenario?.blockScenarioId === "pan-consent") {
        sanitizedText = userMessage.replace(
          /\b[A-Z]{5}[0-9]{4}[A-Z]\b/gi,
          "[PAN REDACTED]"
        );
      }

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
          blockScenarioId: scenario?.blockScenarioId || null,
          originalText:
            scenario?.status === "cleaned" ? userMessage : null,
          sanitizedText:
            scenario?.status === "cleaned"
              ? sanitizedText
              : null,
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
      {/* HEADER */}
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

      {/* MESSAGES */}
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
              <>
                {/* SECURITY BADGE */}
                <div
                  className={`security-badge ${message.status}`}
                >
                  {message.status === "allowed" && "✅"}
                  {message.status === "warning" && "⚠️"}
                  {message.status === "cleaned" && "🧹"}
                  {message.status === "blocked" && "🚫"}

                  {" "}
                  {message.label}
                </div>

                {/* SANITIZATION DETAILS */}
                {message.status === "cleaned" &&
                  message.originalText &&
                  message.sanitizedText && (
                    <div className="sanitization-card">
                      <div className="sanitization-header">
                        <span>🧹</span>
                        <div>
                          <strong>Information Sanitized</strong>
                          <p>
                            Sensitive information was removed
                            before processing.
                          </p>
                        </div>
                      </div>

                      <div className="sanitization-content">
                        <div className="sanitization-column">
                          <span className="sanitization-label">
                            ORIGINAL
                          </span>

                          <div className="sanitization-original">
                            {message.originalText}
                          </div>
                        </div>

                        <div className="sanitization-arrow">
                          →
                        </div>

                        <div className="sanitization-column">
                          <span className="sanitization-label">
                            SANITIZED
                          </span>

                          <div className="sanitization-clean">
                            {message.sanitizedText}
                          </div>
                        </div>
                      </div>

                      <div className="sanitization-footer">
                        ✓ Safe version sent to AI assistant
                      </div>
                    </div>
                  )}

                {/* BLOCK DETAILS */}
                {message.status === "blocked" &&
                  message.blockScenarioId && (
                    <button
                      className="view-block-button"
                      onClick={() =>
                        onOpenBlockScreen(
                          message.blockScenarioId
                        )
                      }
                    >
                      View Block Details →
                    </button>
                  )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="chat-input-area">
        <input
          type="text"
          placeholder="Message your AI assistant..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}


export default EmployeeChat;