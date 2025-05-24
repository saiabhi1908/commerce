import React, { useState } from "react";
import axios from "axios";

const AIChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [appointmentStep, setAppointmentStep] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    name: "",
    doctorId: "",
    time: "",
  });
  const [doctors, setDoctors] = useState([]);

  const styles = {
    toggleButton: {
      position: "fixed",
      bottom: "20px",
      left: "20px",
      zIndex: 999,
      padding: "0.7rem 1rem",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "20px",
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    },
    container: {
      position: "fixed",
      bottom: "80px",
      left: "20px",
      width: "320px",
      maxHeight: "480px",
      backgroundColor: "#f4f4f4",
      borderRadius: "10px",
      fontFamily: "sans-serif",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
      display: open ? "flex" : "none",
      flexDirection: "column",
      zIndex: 1000,
    },
    chatbox: {
      flex: 1,
      overflowY: "auto",
      padding: "1rem",
      backgroundColor: "#fff",
      borderTopLeftRadius: "10px",
      borderTopRightRadius: "10px",
      borderBottom: "1px solid #ddd",
    },
    message: {
      margin: "0.5rem 0",
    },
    user: {
      textAlign: "right",
      color: "#007bff",
    },
    bot: {
      textAlign: "left",
      color: "#333",
    },
    inputArea: {
      display: "flex",
      gap: "0.5rem",
      padding: "0.5rem",
      borderTop: "1px solid #ccc",
      backgroundColor: "#f9f9f9",
    },
    input: {
      flex: 1,
      padding: "0.4rem",
      borderRadius: "6px",
      border: "1px solid #ccc",
    },
    button: {
      padding: "0.4rem 0.8rem",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    },
  };

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const handleAppointmentFlow = async (input) => {
    let data = { ...appointmentData };

    switch (appointmentStep) {
      case "askName":
        data.name = input;
        addMessage("bot", "Thanks! Now select a doctor from the list:");
        try {
          const res = await axios.get("https://commerce-v9e9.onrender.com/api/doctors");
          setDoctors(res.data);
          addMessage("bot", res.data.map((doc, idx) => `${idx + 1}. ${doc.name} (${doc.specialization})`).join("\n"));
          setAppointmentStep("chooseDoctor");
        } catch {
          addMessage("bot", "Failed to load doctors.");
          setAppointmentStep(null);
        }
        break;

      case "chooseDoctor":
        const idx = parseInt(input) - 1;
        if (isNaN(idx) || idx < 0 || idx >= doctors.length) {
          addMessage("bot", "Invalid choice. Please select a doctor by number.");
        } else {
          data.doctorId = doctors[idx].id;
          addMessage("bot", `Great! What time do you want the appointment (e.g., 3pm tomorrow)?`);
          setAppointmentStep("askTime");
        }
        break;

      case "askTime":
        data.time = input;
        try {
          await axios.post("https://commerce-v9e9.onrender.com/api/appointments", data);
          addMessage("bot", `Appointment booked with Doctor ID ${data.doctorId} at ${data.time}.`);
        } catch {
          addMessage("bot", "Failed to book appointment. Please try again.");
        }
        setAppointmentStep(null);
        setAppointmentData({ name: "", doctorId: "", time: "" });
        break;

      default:
        break;
    }

    setAppointmentData(data);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const input = userInput;
    addMessage("user", input);
    setUserInput("");
    setLoading(true);

    if (appointmentStep) {
      await handleAppointmentFlow(input);
      setLoading(false);
      return;
    }

    if (input.toLowerCase().includes("book an appointment")) {
      addMessage("bot", "Sure! What's your name?");
      setAppointmentStep("askName");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant for the Prescripta platform. Help users with booking doctor appointments, managing prescriptions, and using the platform. Keep responses short, clear, and focused. Avoid long paragraphs or unrelated content.",
            },
            ...messages.map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text,
            })),
            { role: "user", content: input },
          ],
        }),
      });

      const data = await response.json();
      const botReply = data.choices?.[0]?.message?.content;
      if (botReply) {
        addMessage("bot", botReply.trim());
      } else {
        addMessage("bot", "Sorry, no response received.");
      }
    } catch (error) {
      console.error("Chat API error:", error);
      addMessage("bot", "Error: Could not reach chatbot API.");
    }

    setLoading(false);
  };

  return (
    <>
      <button style={styles.toggleButton} onClick={() => setOpen(!open)}>
        {open ? "Close Chat" : "Chat with us 💬"}
      </button>
      <div style={styles.container}>
        <div style={styles.chatbox}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                ...styles.message,
                ...(msg.sender === "user" ? styles.user : styles.bot),
              }}
            >
              <strong>{msg.sender === "user" ? "You" : "Bot"}:</strong> {msg.text}
            </div>
          ))}
        </div>
        <div style={styles.inputArea}>
          <input
            style={styles.input}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage} style={styles.button} disabled={loading}>
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </>
  );
};

export default AIChatBot;
