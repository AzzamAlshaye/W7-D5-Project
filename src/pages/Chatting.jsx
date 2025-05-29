import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatWindow from "./ChatWindow";

const API_URL = "https://683878942c55e01d184d6bf0.mockapi.io/messages";

export default function Chatting() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Error fetching messages:", err));
  }, []);

  const sendMessage = (sender, text) => {
    if (text.trim() === "") return;
    const newMessage = { sender, text };
    axios
      .post(API_URL, newMessage)
      .then((res) => setMessages((prev) => [...prev, res.data]))
      .catch((err) => console.error("Error sending message:", err));
  };

  const chatStyle = {
    backgroundImage: `url(Chat_background.png)`,
    backgroundSize: "cover",
  };

  return (
    <div className="flex justify-center items-start min-h-screen gap-8 bg-black p-10">
      <ChatWindow
        user="Amy"
        otherUser="John"
        messages={messages}
        sendMessage={sendMessage}
        style={chatStyle}
      />
      <ChatWindow
        user="John"
        otherUser="Amy"
        messages={messages}
        sendMessage={sendMessage}
        style={chatStyle}
      />
    </div>
  );
}
