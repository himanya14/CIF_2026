import { useState } from "react";
import ChatMessage from "./ChatMessage";
import { inspectPrompt } from "../../services/api";
import "../../styles/EmployeeChat.css";

function EmployeeChat({ onOpenBlockScreen }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const [isInspecting, setIsInspecting] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: userMessage,
        isUser: true,
      },
    ]);

    setInput("");
    setIsInspecting(true);
    try {
      const scenario = await inspectPrompt(userMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: scenario.response,
          isUser: false,
          status: scenario.status,
          label: scenario.label,
          department: scenario.department,
          category: scenario.category,
          blockScenarioId: scenario.blockScenarioId,
          originalText: scenario.originalText,
          sanitizedText: scenario.sanitizedText,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: `Security service error: ${error.message}`, isUser: false, status: "warning", label: "Service unavailable" }]);
    } finally {
      setIsInspecting(false);
    }
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
                  {message.department && ` • ${message.department} / ${message.category}`}
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

        <button onClick={handleSend} disabled={isInspecting}>
          {isInspecting ? "Inspecting..." : "Send"}
        </button>
      </div>
    </div>
  );
}


export default EmployeeChat;
