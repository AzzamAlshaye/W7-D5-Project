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
  const currentUserName = localStorage.getItem("fullName") || "";
  useEffect(() => {
    if (!isAuth || !userId) navigate("/login");
  }, [isAuth, userId, navigate]);

  // --- State ---
  const [allUsers, setAllUsers] = useState([]); // all other users
  const [selectedUser, setSelectedUser] = useState(null);
  const [entries, setEntries] = useState([]); // both requests and chats
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);

  // --- Load all users except self ---
  useEffect(() => {
    axios
      .get(USERS_API)
      .then((res) => {
        const others = res.data.filter((u) => u.id !== userId);
        setAllUsers(others);
        if (others.length && !selectedUser) setSelectedUser(others[0]);
      })
      .catch(console.error);
  }, [userId]);

  // --- Load all message entries ---
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

  // --- Separate requests and chats ---
  const requests = entries.filter((e) => e.type === "request");
  const chats = entries.filter(
    (e) => e.type === "chat" && e.status === "accepted"
  );

  // --- Determine status for selected user ---
  const currentRequest = requests.find(
    (r) =>
      (r.fromId === userId && r.toId === selectedUser?.id) ||
      (r.fromId === selectedUser?.id && r.toId === userId)
  );
  const status = currentRequest?.status;

  // --- Compute accepted and available lists ---
  const acceptedIds = requests
    .filter(
      (r) =>
        r.status === "accepted" && (r.fromId === userId || r.toId === userId)
    )
    .map((r) => (r.fromId === userId ? r.toId : r.fromId));

  const acceptedContacts = allUsers.filter((u) => acceptedIds.includes(u.id));
  const availableContacts = allUsers.filter((u) => !acceptedIds.includes(u.id));

  // --- Conversation messages if accepted ---
  const convo = chats
    .filter(
      (m) =>
        (m.fromId === userId && m.toId === selectedUser?.id) ||
        (m.fromId === selectedUser?.id && m.toId === userId)
    )
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // --- Actions ---
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

  const cancelRequest = () => {
    if (!currentRequest) return;
    axios
      .delete(`${MESSAGES_API}/${currentRequest.id}`)
      .then(fetchEntries)
      .catch(console.error);
  };

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

  // --- Auto scroll ---
  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [convo]);

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <aside className="w-1/4 bg-gray-800 text-white p-4 overflow-y-auto">
        <section>
          <h3 className="font-semibold mb-2">Contacts</h3>
          <ul className="mb-6">
            {acceptedContacts.map((u) => (
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
            {acceptedContacts.length === 0 && (
              <li className="text-sm text-gray-400">No contacts yet.</li>
            )}
          </ul>
        </section>

        <section>
          <h3 className="font-semibold mb-2">All Contacts</h3>
          <ul>
            {availableContacts.map((u) => (
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
        </section>
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

          {selectedUser && status !== "accepted" && (
            <div className="mt-10 text-center space-y-2">
              {status === undefined && (
                <button
                  onClick={sendRequest}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Send Chat Request
                </button>
              )}
              {status === "pending" && (
                <>
                  {currentRequest.fromId === userId ? (
                    <button
                      onClick={cancelRequest}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Cancel Request
                    </button>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={acceptRequest}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={cancelRequest}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {status === "accepted" &&
            convo.map((msg) => {
              const mine = msg.fromId === userId;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    mine ? "items-end" : "items-start"
                  }`}
                >
                  <span className="text-xs font-semibold text-gray-300 mb-1">
                    {mine ? currentUserName : selectedUser.fullName}
                  </span>
                  <div
                    className={`max-w-[70%] px-4 py-2 mb-4 rounded-lg break-words ${
                      mine
                        ? "bg-green-400 text-white"
                        : "bg-gray-700 text-gray-100"
                    }`}
                  >
                    {msg.text}
                  </div>
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
