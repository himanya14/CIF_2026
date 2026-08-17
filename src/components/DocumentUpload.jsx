import { useRef, useState } from "react";
import {
  FaCloudUploadAlt,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
} from "react-icons/fa";

function DocumentUpload() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setError("");
    setResult(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const allowedTypes = [
      ".pdf",
      ".docx",
      ".txt",
      ".csv",
    ];

    const extension =
      "." +
      selectedFile.name
        .split(".")
        .pop()
        .toLowerCase();

    if (!allowedTypes.includes(extension)) {
      setError(
        "Unsupported file type. Please upload a PDF, DOCX, TXT, or CSV file."
      );
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10 MB.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a document first.");
      return;
    }

    setUploading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("document", file);

      const response = await fetch(
        "http://localhost:4000/api/documents/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Document upload failed."
        );
      }

      setResult(data);
    } catch (uploadError) {
      console.error(uploadError);

      setError(
        uploadError.message ||
          "Unable to upload the document."
      );
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="document-upload-card">
      <div className="document-upload-header">
        <div className="document-upload-title">
          <FaCloudUploadAlt />

          <div>
            <h2>Document Security Scanner</h2>
            <p>
              Upload a document to scan it for sensitive
              information and security risks.
            </p>
          </div>
        </div>
      </div>

      <div
        className="document-upload-dropzone"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.csv"
          onChange={handleFileChange}
          hidden
        />

        <FaCloudUploadAlt className="upload-icon" />

        <strong>
          {file
            ? file.name
            : "Click to select a document"}
        </strong>

        <span>
          Supported: PDF, DOCX, TXT, CSV · Max 10 MB
        </span>
      </div>

      {file && (
        <div className="selected-document">
          <div className="selected-document-info">
            <FaFileAlt />

            <div>
              <strong>{file.name}</strong>
              <span>
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={clearFile}
            disabled={uploading}
          >
            <FaTimesCircle />
            Remove
          </button>
        </div>
      )}

      {error && (
        <div className="document-upload-error">
          <FaTimesCircle />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        className="document-upload-button"
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? (
          <>
            <FaSpinner className="upload-spinner" />
            Scanning Document...
          </>
        ) : (
          <>
            <FaShieldAltIcon />
            Scan Document
          </>
        )}
      </button>

      {result && (
        <div className="document-upload-result">
          <FaCheckCircle />

          <div>
            <strong>
              Document processed successfully
            </strong>

            <span>
              {result.message ||
                "The document has been scanned successfully."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function FaShieldAltIcon() {
  return <FaCheckCircle />;
}

export default DocumentUpload;