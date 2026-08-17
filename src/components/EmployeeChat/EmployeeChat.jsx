import { useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import {
  inspectPrompt,
  uploadDocument,
} from "../../services/api";
import "../../styles/EmployeeChat.css";

function EmployeeChat({ onOpenBlockScreen }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isInspecting, setIsInspecting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);

  const allowedExtensions = [".pdf", ".docx", ".txt", ".csv"];

  const getMlConfidence = (confidence) => {
    if (confidence === null || confidence === undefined) {
      return null;
    }

    return `${(Number(confidence) * 100).toFixed(2)}%`;
  };

  const handleSend = async () => {
    if (!input.trim() || isInspecting) return;

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
          riskScore: scenario.riskScore,
          confidence: scenario.confidence,
          policy: scenario.policy,
          blockScenarioId: scenario.blockScenarioId,
          incidentId: scenario.incidentId,
          originalText: scenario.originalText,
          sanitizedText: scenario.sanitizedText,

          // DISTILBERT
          mlLabel: scenario.mlLabel,
          mlConfidence: scenario.mlConfidence,
          mlModel: scenario.mlModel || "DistilBERT",

          detectedItems: scenario.detectedItems || [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: `Security service error: ${error.message}`,
          isUser: false,
          status: "warning",
          label: "Service unavailable",
        },
      ]);
    } finally {
      setIsInspecting(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setFileError("");

    if (!file) return;

    const extension =
      "." +
      file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setFileError(
        "Unsupported file type. Use PDF, DOCX, TXT, or CSV."
      );
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileError(
        "File is too large. Maximum size is 10 MB."
      );
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFileError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDocumentUpload = async () => {
    if (!selectedFile || isInspecting) return;

    const file = selectedFile;

    setIsInspecting(true);
    setFileError("");

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        isUser: true,
        isDocument: true,
        fileName: file.name,
        fileSize: file.size,
        text: "Check this document",
      },
    ]);

    clearSelectedFile();

    try {
      const result = await uploadDocument(file);
      const scan = result.scan;

      if (!scan) {
        throw new Error(
          "The server did not return a security scan result."
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          isUser: false,
          isDocumentResult: true,

          text:
            result.message ||
            scan.response ||
            "Document scan completed.",

          status: scan.status,
          label: scan.label,
          department: scan.department,
          category: scan.category,
          riskScore: scan.riskScore,
          confidence: scan.confidence,
          policy: scan.policy,

          // IMPORTANT: DISTILBERT FOR DOCUMENTS
          mlLabel: scan.mlLabel,
          mlConfidence: scan.mlConfidence,
          mlModel: scan.mlModel || "DistilBERT",

          detectedItems: scan.detectedItems || [],

          originalText: scan.originalText,
          sanitizedText: scan.sanitizedText,
          blockScenarioId: scan.blockScenarioId,
          incidentId: scan.incidentId,
          filename: file.name,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          isUser: false,
          text: `Document security scan failed: ${error.message}`,
          status: "warning",
          label: "Scan failed",
        },
      ]);
    } finally {
      setIsInspecting(false);
    }
  };

  return (
    <div className="employee-chat">

      <div className="chat-header">
        <div>
          <h1>Employee AI Assistant</h1>
          <p>
            Your conversations are protected by AI Watchtower
          </p>
        </div>

        <div className="security-status">
          <span className="status-dot" />
          Protected
        </div>
      </div>

      <div className="chat-messages">

        {messages.length === 0 && (
          <div className="empty-chat">
            <h2>How can I help you?</h2>
            <p>
              Ask the AI assistant anything or upload a document.
              AI Watchtower will scan messages and documents for
              security risks.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div className="chat-message" key={message.id}>

            {message.isDocument ? (
              <div className="user-message">
                <div className="user-document-message">

                  <div className="document-message-icon">
                    📄
                  </div>

                  <div className="document-message-info">
                    <strong>{message.fileName}</strong>

                    <span>
                      {(message.fileSize / 1024).toFixed(1)} KB
                    </span>

                    <p>Check this document</p>
                  </div>

                </div>
              </div>
            ) : (
              <ChatMessage
                message={message.text}
                isUser={message.isUser}
              />
            )}

            {!message.isUser && message.status && (
              <>
                {message.isDocumentResult ? (

                  <div className="document-result-card">

                    <div className="document-result-header">
                      <span className="document-result-icon">
                        {message.status === "blocked"
                          ? "🚫"
                          : message.status === "cleaned"
                          ? "🧹"
                          : "🛡️"}
                      </span>

                      <div>
                        <strong>AI Watchtower</strong>
                        <span>{message.filename}</span>
                      </div>
                    </div>

                    <div
                      className={`security-badge ${message.status}`}
                    >
                      {message.status === "allowed" && "✓"}
                      {message.status === "cleaned" && "🧹"}
                      {message.status === "blocked" && "🚫"}{" "}
                      {message.label}
                    </div>

                    <div className="document-result-status">
                      <span>
                        {message.status === "blocked"
                          ? "🚫"
                          : message.status === "cleaned"
                          ? "⚠"
                          : "✓"}
                      </span>

                      <div>
                        <strong>{message.text}</strong>

                        <p>
                          AI Watchtower scanned the extracted
                          document content.
                        </p>
                      </div>
                    </div>

                    {message.detectedItems?.length > 0 && (
                      <div className="document-findings">
                        <div className="document-findings-list">

                          <strong>
                            Detected security information
                          </strong>

                          {message.detectedItems.map((item) => (
                            <div
                              className="document-finding-row"
                              key={item}
                            >
                              <span>
                                {message.status === "blocked"
                                  ? "🔴"
                                  : "🟡"}{" "}
                                {item}
                              </span>

                              <strong>Detected</strong>
                            </div>
                          ))}

                        </div>
                      </div>
                    )}

                    <div className="document-findings">

                      <div className="document-finding-row">
                        <span>Risk Score</span>
                        <strong>{message.riskScore}</strong>
                      </div>

                      <div className="document-finding-row">
                        <span>Department</span>
                        <strong>{message.department}</strong>
                      </div>

                      <div className="document-finding-row">
                        <span>Category</span>
                        <strong>{message.category}</strong>
                      </div>

                      <div className="document-finding-row">
                        <span>Policy</span>
                        <strong>{message.policy}</strong>
                      </div>

                    </div>

                    {/* =========================================
                        DISTILBERT DOCUMENT ANALYSIS
                       ========================================= */}

                    {message.mlLabel && (
                      <div
                        className={`ml-result-card ${message.mlLabel.toLowerCase()}`}
                      >

                        <div className="ml-result-header">

                          <span>🤖</span>

                          <span>AI Analysis</span>

                          <span>•</span>

                          <span>
                            {message.mlModel || "DistilBERT"} analysis
                          </span>

                        </div>

                        <div className="ml-result-content">

                          <div>
                            <span>ML Classification</span>

                            <strong>
                              {message.mlLabel}
                            </strong>
                          </div>

                          {message.mlConfidence !==
                            null &&
                            message.mlConfidence !==
                              undefined && (
                              <div>
                                <span>Confidence</span>

                                <strong>
                                  {getMlConfidence(
                                    message.mlConfidence
                                  )}
                                </strong>
                              </div>
                            )}

                        </div>

                        <div className="ml-result-description">
                          DistilBERT machine-learning analysis
                          was performed on the extracted document
                          content. This ML result is separate from
                          the security-rule decision.
                        </div>

                      </div>
                    )}

                    {/* ========================================= */}

                    {message.status === "cleaned" &&
                      message.originalText &&
                      message.sanitizedText && (

                        <div className="sanitization-card">

                          <div className="sanitization-header">

                            <span>🧹</span>

                            <div>
                              <strong>
                                Information Sanitized
                              </strong>

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
                            ✓ Safe version created
                          </div>

                        </div>
                      )}

                    {message.status === "blocked" &&
                      message.blockScenarioId && (

                        <button
                          type="button"
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

                  </div>

                ) : (

                  <>
                    <div
                      className={`security-badge ${
                        message.status || ""
                      }`}
                    >
                      {message.status === "allowed" && "✓"}
                      {message.status === "warning" && "⚠"}
                      {message.status === "cleaned" && "🧹"}
                      {message.status === "blocked" && "🚫"}{" "}
                      {message.label}

                      {message.department &&
                        ` • ${message.department} / ${message.category}`}
                    </div>

                    {message.mlLabel && (
                      <div
                        className={`ml-result-card ${message.mlLabel.toLowerCase()}`}
                      >

                        <div className="ml-result-header">
                          <span>🤖</span>
                          <span>AI Analysis</span>
                          <span>•</span>
                          <span>
                            {message.mlModel || "DistilBERT"} analysis
                          </span>
                        </div>

                        <div className="ml-result-content">

                          <div>
                            <span>ML Classification</span>

                            <strong>
                              {message.mlLabel}
                            </strong>
                          </div>

                          {message.mlConfidence !==
                            null &&
                            message.mlConfidence !==
                              undefined && (

                            <div>
                              <span>Confidence</span>

                              <strong>
                                {getMlConfidence(
                                  message.mlConfidence
                                )}
                              </strong>
                            </div>
                          )}

                        </div>

                        <div className="ml-result-description">
                          DistilBERT machine-learning analysis
                          is separate from the security decision.
                        </div>

                      </div>
                    )}

                    {message.status === "cleaned" &&
                      message.originalText &&
                      message.sanitizedText && (

                        <div className="sanitization-card">

                          <div className="sanitization-header">
                            <span>🧹</span>

                            <div>
                              <strong>
                                Information Sanitized
                              </strong>

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

                    {message.status === "blocked" &&
                      message.blockScenarioId && (

                        <button
                          type="button"
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
              </>
            )}
          </div>
        ))}
      </div>

      <div className="chat-input-area">

        {selectedFile && (
          <div className="chat-selected-file">

            <div className="chat-selected-file-info">

              <span className="chat-file-icon">
                📄
              </span>

              <div>
                <strong>
                  {selectedFile.name}
                </strong>

                <span>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>

            </div>

            <button
              type="button"
              onClick={clearSelectedFile}
              disabled={isInspecting}
            >
              ×
            </button>

          </div>
        )}

        {fileError && (
          <div className="chat-file-error">
            {fileError}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.csv"
          onChange={handleFileChange}
          hidden
        />

        <button
          type="button"
          className="chat-attach-button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          disabled={isInspecting}
          title="Upload document"
        >
          +
        </button>

        <input
          type="text"
          placeholder="Message your AI assistant..."
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          onKeyDown={handleKeyDown}
          disabled={isInspecting}
        />

        {selectedFile ? (
          <button
            type="button"
            onClick={handleDocumentUpload}
            disabled={isInspecting}
          >
            {isInspecting
              ? "Scanning..."
              : "Scan File"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            disabled={
              isInspecting ||
              !input.trim()
            }
          >
            {isInspecting
              ? "Inspecting..."
              : "Send"}
          </button>
        )}

      </div>
    </div>
  );
}

export default EmployeeChat;