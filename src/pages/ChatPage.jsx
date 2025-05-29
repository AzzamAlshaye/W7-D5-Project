import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { FiSend } from "react-icons/fi";

export default function ChatPage() {
  const navigate = useNavigate();

  // Ensure user is logged in
  const stored = JSON.parse(localStorage.getItem("userId"));
  useEffect(() => {
    if (!stored) navigate("/login");
  }, [stored, navigate]);

  const currentUser = stored;

  // State for contacts (all users except current)
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // Chat messages and draft
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);

  // Fetch all users as contacts
  useEffect(() => {
    axios
      .get("https://683878942c55e01d184d6bf0.mockapi.io/auth")
      .then((res) => {
        const others = res.data.filter((u) => u.id !== currentUser.id);
        setContacts(others);
        if (others.length) setSelectedUser(others[0]);
      })
      .catch(console.error);
  }, [currentUser.id]);

  // Fetch conversation with selected user
  const fetchMessages = () => {
    if (!selectedUser) return;
    axios
      .get("https://683878942c55e01d184d6bf0.mockapi.io/messages")
      .then((res) => {
        const convo = res.data
          .filter(
            (m) =>
              (m.fromId === currentUser.id && m.toId === selectedUser.id) ||
              (m.fromId === selectedUser.id && m.toId === currentUser.id)
          )
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setMessages(convo);
      })
      .catch(console.error);
  };

  // Poll messages on selected user change
  useEffect(() => {
    fetchMessages();
    const id = setInterval(fetchMessages, 3000);
    return () => clearInterval(id);
  }, [selectedUser]);

  // Auto-scroll
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!draft.trim() || !selectedUser) return;
    await axios.post("https://683878942c55e01d184d6bf0.mockapi.io/messages", {
      fromId: currentUser.id,
      toId: selectedUser.id,
      text: draft.trim(),
      createdAt: new Date().toISOString(),
    });
    setDraft("");
    fetchMessages();
  };

  return (
    <div className="h-screen flex">
      {/* Contacts sidebar */}
      <div className="w-1/4 bg-gray-800 text-white p-4 overflow-y-auto">
        <h3 className="font-semibold mb-4">Contacts</h3>
        <ul>
          {contacts.map((u) => (
            <li key={u.id}>
              <button
                onClick={() => setSelectedUser(u)}
                className={`block w-full text-left px-3 py-2 mb-2 rounded transition ${
                  selectedUser?.id === u.id
                    ? "bg-gray-700"
                    : "hover:bg-gray-700"
                }`}
              >
                {u.fullName}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat area */}
      <div
        className="flex-1 flex flex-col bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1525186402429-7ee27cd56906?auto=format&fit=crop&w=1350&q=80')",
        }}
      >
        {/* Header */}
        <div className="flex items-center p-4 bg-black bg-opacity-50 text-white">
          <button
            onClick={() => {
              localStorage.removeItem("user");
              localStorage.removeItem("isAuthenticated");
              navigate("/login");
            }}
            className="mr-4 text-lg"
          >
            ← Logout
          </button>
          <h2 className="text-lg font-medium">
            {selectedUser?.fullName || "Select a contact"}
          </h2>
        </div>

        {/* Messages list */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg) => {
            const mine = msg.fromId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`max-w-[70%] px-4 py-2 rounded-lg break-words ${
                  mine
                    ? "ml-auto bg-green-400 text-white"
                    : "mr-auto bg-gray-700 text-gray-100"
                }`}
              >
                {msg.text}
              </div>
            );
          })}
        </div>

        {/* Input area */}
        <div className="flex items-center p-4 bg-black bg-opacity-50">
          <input
            className="flex-1 rounded-full px-4 py-2 mr-2 bg-white bg-opacity-80 placeholder-gray-700 focus:outline-none"
            placeholder="Type a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="p-3 bg-green-500 rounded-full text-white hover:bg-green-600"
          >
            <FiSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
