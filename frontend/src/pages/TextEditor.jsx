import { useState, useEffect, useRef } from "react";
import Quill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Use the current host with backend port 5001
const API_BASE_URL = `http://${window.location.hostname}:5002`;

function TextEditor() {
  const [text, setText] = useState(""); // Fixed syntax error
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Fetch text on mount
  useEffect(() => {
    fetchText();
  }, []);

  // Auto-save when text changes
  useEffect(() => {
    if (text) {
      setIsSaving(true);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveText();
      }, 2000); // Save after 2 seconds of inactivity
    }
    return () => clearTimeout(saveTimeoutRef.current);
  }, [text]);

  const fetchText = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/fetch`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.text) {
        setText(data.text);
      }
    } catch (error) {
      console.error("Error fetching text:", error);
      setMessage("Failed to fetch text. Check network or server.");
    }
  };

  const saveText = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessage(data.message || "Text saved successfully");
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving text:", error);
      setMessage("Failed to save text. Check network or server.");
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Rich Text Editor</h1>
      <div className="w-full max-w-2xl">
        <Quill
          theme="snow"
          value={text}
          onChange={setText}
          className="bg-white border rounded-md"
          placeholder="Type your text here..."
        />
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        onClick={saveText}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Now"}
      </button>
      {message && (
        <p className={`mt-2 text-sm ${message.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export default TextEditor;