function ChatMessage({ message, isUser }) {
  return (
    <div className={`chat-message ${isUser ? "user-message" : "ai-message"}`}>
      <div className="message-sender">
        {isUser ? "You" : "AI Watchtower"}
      </div>

      <div className="message-bubble">
        {message}
      </div>
    </div>
  );
}

export default ChatMessage;