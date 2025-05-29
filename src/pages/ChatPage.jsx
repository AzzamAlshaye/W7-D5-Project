import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import {
  FiSend,
  FiMoreVertical,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";

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
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [draft, setDraft] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [allContactsOpen, setAllContactsOpen] = useState(false);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const listRef = useRef(null);

  // --- Fetch users ---
  useEffect(() => {
    axios
      .get(USERS_API)
      .then((res) => {
        const others = res.data.filter((u) => u.id !== userId);
        setAllUsers(others);
        if (!selectedUser && others.length) setSelectedUser(others[0]);
      })
      .catch(console.error);
  }, [userId]);

  // --- Fetch entries ---
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

  // --- Status for selected user ---
  const currentRequest = requests.find(
    (r) =>
      (r.fromId === userId && r.toId === selectedUser?.id) ||
      (r.fromId === selectedUser?.id && r.toId === userId)
  );
  const status = currentRequest?.status;

  // --- Compute contacts lists ---
  const acceptedIds = requests
    .filter(
      (r) =>
        r.status === "accepted" && (r.fromId === userId || r.toId === userId)
    )
    .map((r) => (r.fromId === userId ? r.toId : r.fromId));

  const acceptedContacts = allUsers.filter((u) => acceptedIds.includes(u.id));
  const availableContacts = allUsers.filter((u) => !acceptedIds.includes(u.id));

  // --- Conversation if accepted ---
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
      {sidebarOpen && (
        <aside className="lg:w-1/4 w-full bg-gray-800 text-white p-4 relative">
          <section>
            <div className="p-2 mb-2 rounded bg-[#1c2838]">
              <h3 className="font-semibold">Contacts</h3>
            </div>
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
              {!acceptedContacts.length && (
                <li className="text-sm text-gray-400">No contacts yet.</li>
              )}
            </ul>

            {/* All Contacts collapsible */}
            <div
              className="p-2 mb-2 rounded cursor-pointer flex justify-between items-center bg-gray-700"
              onClick={() => setAllContactsOpen(!allContactsOpen)}
            >
              <span className="font-semibold">All Contacts</span>
              {allContactsOpen ? <FiChevronDown /> : <FiChevronRight />}
            </div>
            {allContactsOpen && (
              <ul className="mb-6">
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
            )}

            {/* Logout menu */}
            <div className="absolute bottom-4 left-4">
              <button onClick={() => setShowLogoutMenu(!showLogoutMenu)}>
                <FiMoreVertical size={24} />
              </button>
              {showLogoutMenu && (
                <button
                  onClick={() => {
                    localStorage.clear();
                    navigate("/login");
                  }}
                  className="mt-2 text-sm text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                >
                  Logout
                </button>
              )}
            </div>

            {/* Sidebar toggler at bottom */}
            <button
              className="absolute bottom-4 right-4 text-sm text-white bg-gray-700 p-1 rounded hover:bg-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              Close
            </button>
          </section>
        </aside>
      )}

      {/* Chat area */}
      <div
        className={`flex-1 flex flex-col bg-cover bg-center transition-all ${
          sidebarOpen ? "" : "ml-0"
        }`}
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1525186402429-7ee27cd56906?auto=format&fit=crop&w=1350&q=80')`,
        }}
      >
        {/* Header with toggler */}
        <header className="flex items-center p-4 bg-black bg-opacity-50 text-white">
          {!sidebarOpen && (
            <button
              className="mr-4 p-2 bg-gray-800 text-white rounded hover:bg-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              Open
            </button>
          )}
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
              {status === "pending" &&
                (currentRequest.fromId === userId ? (
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
                ))}
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
