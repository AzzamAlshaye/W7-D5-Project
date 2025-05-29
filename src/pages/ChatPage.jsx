import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { FiSend } from "react-icons/fi";

// Endpoints
const USERS_API = "https://683878942c55e01d184d6bf0.mockapi.io/auth";
const MESSAGES_API = "https://683878942c55e01d184d6bf0.mockapi.io/messages";

export default function ChatPage() {
  const navigate = useNavigate();

  // --- Auth guard ---
  const isAuth = localStorage.getItem("isAuthenticated") === "true";
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    if (!isAuth || !userId) navigate("/login");
  }, [isAuth, userId, navigate]);

  // --- State ---
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [entries, setEntries] = useState([]); // both requests and chats
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);

  // --- Load contacts (exclude self) ---
  useEffect(() => {
    axios
      .get(USERS_API)
      .then((res) => {
        const others = res.data.filter((u) => u.id !== userId);
        setContacts(others);
        if (others.length) setSelectedUser(others[0]);
      })
      .catch(console.error);
  }, [userId]);

  // --- Load all entries ---
  const fetchEntries = () => {
    axios
      .get(MESSAGES_API)
      .then((res) => setEntries(res.data))
      .catch(console.error);
  };
  useEffect(() => {
    fetchEntries();
    const id = setInterval(fetchEntries, 5000);
    return () => clearInterval(id);
  }, []);

  // --- Separate requests and accepted chats ---
  const requests = entries.filter((e) => e.type === "request");
  const chats = entries.filter(
    (e) => e.type === "chat" && e.status === "accepted"
  );

  // --- Determine current request status ---
  const currentRequest = requests.find(
    (r) =>
      (r.fromId === userId && r.toId === selectedUser?.id) ||
      (r.fromId === selectedUser?.id && r.toId === userId)
  );
  const status = currentRequest?.status; // undefined | 'pending' | 'accepted'

  // --- Filter conversation based on accepted chats ---
  const convo = chats
    .filter(
      (m) =>
        (m.fromId === userId && m.toId === selectedUser?.id) ||
        (m.fromId === selectedUser?.id && m.toId === userId)
    )
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // --- Send chat request ---
  const sendRequest = () => {
    if (!selectedUser) return;
    axios
      .post(MESSAGES_API, {
        fromId: userId,
        toId: selectedUser.id,
        type: "request",
        status: "pending",
        createdAt: new Date().toISOString(),
      })
      .then(fetchEntries)
      .catch(console.error);
  };

  // --- Accept chat request ---
  const acceptRequest = () => {
    if (!currentRequest) return;
    axios
      .put(`${MESSAGES_API}/${currentRequest.id}`, {
        ...currentRequest,
        status: "accepted",
      })
      .then(fetchEntries)
      .catch(console.error);
  };

  // --- Send chat message ---
  const sendMessage = () => {
    if (!draft.trim() || status !== "accepted") return;
    axios
      .post(MESSAGES_API, {
        fromId: userId,
        toId: selectedUser.id,
        type: "chat",
        status: "accepted",
        text: draft.trim(),
        createdAt: new Date().toISOString(),
      })
      .then(() => {
        setDraft("");
        fetchEntries();
      })
      .catch(console.error);
  };

  // --- Auto-scroll on new messages ---
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [convo]);

  return (
    <div className="h-screen flex">
      {/* Contacts sidebar */}
      <aside className="w-1/4 bg-gray-800 text-white p-4 overflow-y-auto">
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
      </aside>

      {/* Chat area */}
      <div
        className="flex-1 flex flex-col bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1525186402429-7ee27cd56906?auto=format&fit=crop&w=1350&q=80')`,
        }}
      >
        {/* Header */}
        <header className="flex items-center p-4 bg-black bg-opacity-50 text-white">
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="mr-4 text-lg"
          >
            ← Logout
          </button>
          <h2 className="text-lg font-medium">
            {selectedUser?.fullName || "Select a contact"}
          </h2>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 overflow-y-auto" ref={listRef}>
          {!selectedUser && (
            <p className="text-center text-gray-300 mt-10">
              No contact selected.
            </p>
          )}

          {/* Request flow */}
          {selectedUser && status !== "accepted" && (
            <div className="mt-10 text-center">
              {status === undefined && (
                <button
                  onClick={sendRequest}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Send Chat Request
                </button>
              )}
              {status === "pending" && currentRequest.fromId === userId && (
                <p className="text-yellow-300">Request pending…</p>
              )}
              {status === "pending" && currentRequest.toId === userId && (
                <button
                  onClick={acceptRequest}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Accept Request
                </button>
              )}
            </div>
          )}

          {/* Chat messages */}
          {status === "accepted" &&
            convo.map((msg) => {
              const mine = msg.fromId === userId;
              return (
                <div
                  key={msg.id}
                  className={`max-w-[70%] px-4 py-2 my-1 rounded-lg break-words ${
                    mine
                      ? "ml-auto bg-green-400 text-white"
                      : "mr-auto bg-gray-700 text-gray-100"
                  }`}
                >
                  {msg.text}
                </div>
              );
            })}
        </main>

        {/* Footer input */}
        {status === "accepted" && (
          <footer className="flex items-center p-4 bg-black bg-opacity-50">
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
          </footer>
        )}
      </div>
    </div>
  );
}
