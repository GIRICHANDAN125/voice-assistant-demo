import { useState, useRef } from "react";

const VoiceAssistant = () => {
  const [text, setText] = useState(""); // last spoken text
  const [chat, setChat] = useState([]); // chat history
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const recognitionRef = useRef(null);

  // Speak function
  const speak = (message) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  // Start Listening
  const startListening = () => {
    if (listening || processing) return; // Prevent multiple starts

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.interimResults = false;
    recognitionRef.current.continuous = false;

    setListening(true);
    recognitionRef.current.start();

    recognitionRef.current.onresult = async (event) => {
      if (processing) return; // Prevent processing multiple results
      setProcessing(true);

      const voiceText = event.results[0][0].transcript;
      setText(voiceText);

      // Update chat
      setChat((prev) => [...prev, { user: voiceText, bot: "..." }]);

      try {
        const res = await fetch("http://localhost:5000/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: voiceText }),
        });

        const data = await res.json();

        // Update chat with bot answer
        setChat((prev) => {
          const newChat = [...prev];
          newChat[newChat.length - 1].bot = data.answer;
          return newChat;
        });

        speak(data.answer);
      } catch (error) {
        setChat((prev) => {
          const newChat = [...prev];
          newChat[newChat.length - 1].bot = "Error: Backend not responding";
          return newChat;
        });
        speak("Sorry, backend is not responding");
      } finally {
        setProcessing(false);
      }
    };

    recognitionRef.current.onend = () => {
      setListening(false);
    };

    recognitionRef.current.onerror = () => {
      setListening(false);
      setProcessing(false);
      speak("Error while listening. Please try again.");
    };
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "500px",
        margin: "50px auto",
        padding: "20px",
        borderRadius: "20px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
        background: "#1f1f1f",
        color: "#fff",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        🎤 Alexa-Style Voice Assistant
      </h2>

      {/* Chat History */}
      <div
        style={{
          minHeight: "300px",
          maxHeight: "400px",
          overflowY: "auto",
          background: "#2c2c2c",
          borderRadius: "10px",
          padding: "10px",
          marginBottom: "20px",
        }}
      >
        {chat.length === 0 && (
          <p style={{ textAlign: "center", color: "#aaa" }}>
            Say something to start...
          </p>
        )}
        {chat.map((msg, index) => (
          <div key={index} style={{ marginBottom: "15px" }}>
            <p style={{ margin: 0, color: "#00d4ff" }}>
              <strong>You:</strong> {msg.user}
            </p>
            <p style={{ margin: 0, color: "#fff" }}>
              <strong>Assistant:</strong> {msg.bot}
            </p>
          </div>
        ))}
      </div>

      {/* Mic Button */}
      <div style={{ textAlign: "center" }}>
        <button
          onClick={startListening}
          disabled={listening || processing}
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            border: "none",
            background: listening
              ? "radial-gradient(circle, #ff4d4d, #ff0000)"
              : processing
              ? "radial-gradient(circle, #ffa500, #ff8c00)"
              : "radial-gradient(circle, #00d4ff, #0066ff)",
            boxShadow: listening
              ? "0 0 30px #ff4d4d"
              : processing
              ? "0 0 30px #ffa500"
              : "0 0 20px #00d4ff",
            cursor: (listening || processing) ? "not-allowed" : "pointer",
            fontSize: "30px",
            color: "#fff",
            transition: "0.3s",
          }}
        >
          🎤
        </button>
        <p style={{ marginTop: "10px", color: listening ? "#ff4d4d" : processing ? "#ffa500" : "#aaa" }}>
          {listening ? "Listening..." : processing ? "Processing..." : "Click to Speak"}
        </p>
      </div>
    </div>
  );
};

export default VoiceAssistant;
