// ChatWindow.jsx
import React, { useState } from "react";

export default function ChatWindow({
  user,
  otherUser,
  messages,
  sendMessage,
  style,
}) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    sendMessage(user, input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div
      className="w-80 h-[600px] rounded-xl overflow-hidden border-4 border-gray-700 relative"
      style={style}
    >
      <div className="bg-black bg-opacity-60 text-center py-2 text-white font-bold">
        {user}
      </div>
      <div className="p-4 h-[500px] overflow-y-auto space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-[75%] px-3 py-2 rounded-lg text-sm text-white ${
              msg.sender === user
                ? "bg-green-600 self-end ml-auto"
                : "bg-gray-700 self-start mr-auto"
            }`}
          >
            <div className="text-xs text-gray-300 mb-1">{msg.sender}</div>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex items-center bg-black bg-opacity-60 px-3 py-2">
        <input
          type="text"
          className="flex-1 p-2 rounded bg-gray-800 text-white outline-none"
          placeholder="Write a message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSend}
          className="ml-2 text-green-400 text-xl hover:text-green-600"
        >
          📨
        </button>
      </div>
    </div>
  );
}
