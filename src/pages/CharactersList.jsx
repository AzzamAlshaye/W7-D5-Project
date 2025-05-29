import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FiSearch, FiPlus, FiX, FiEdit, FiTrash } from "react-icons/fi";
import { BiWorld } from "react-icons/bi";
import { IoMdMale, IoMdFemale } from "react-icons/io";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CharactersList() {
  const [characters, setCharacters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    image: "",
    gender: "male",
    world: "",
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showMine, setShowMine] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  const API_URL = "https://68370703664e72d28e432cf6.mockapi.io/Characters";
  const isAuth = localStorage.getItem("isAuthenticated") === "true";
  const userEmail = localStorage.getItem("email");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    setLoading(true);
    axios
      .get(API_URL)
      .then((res) => setCharacters(res.data.slice().reverse()))
      .catch(() => toast.error("Failed to load characters"))
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setNewCharacter({ name: "", image: "", gender: "male", world: "" });
    setIsEditing(false);
    setEditId(null);
  };

  const handlePlusClick = () => {
    if (showForm) {
      setShowForm(false);
      return;
    }
    if (!isAuth) {
      toast.error("Please log in to add characters");
      return;
    }
    resetForm();
    setShowForm(true);
    setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const handleSubmit = () => {
    if (!isAuth) {
      toast.error("You must be logged in");
      return;
    }
    if (submitting) {
      return;
    }

    const { name, image, gender, world } = newCharacter;
    if (!name.trim()) return toast.error("Name is required");
    if (!image.trim()) return toast.error("Image URL is required");
    try {
      new URL(image);
    } catch {
      return toast.error("Invalid image URL");
    }
    if (!world.trim()) return toast.error("World is required");

    const payload = {
      name,
      image,
      gender,
      world,
      owner: userEmail,
      userId: userId,
    };
    setSubmitting(true);

    if (isEditing) {
      axios
        .put(`${API_URL}/${editId}`, payload)
        .then((res) => {
          setCharacters((chars) =>
            chars.map((c) => (c.id === editId ? res.data : c))
          );
          toast.success("Character updated");
          resetForm();
          setShowForm(false);
        })
        .catch(() => toast.error("Failed to update character"))
        .finally(() => setSubmitting(false));
    } else {
      axios
        .post(API_URL, payload)
        .then((res) => {
          setCharacters((chars) => [res.data, ...chars]);
          toast.success("Character added");
          resetForm();
          setShowForm(false);
        })
        .catch(() => toast.error("Failed to add character"))
        .finally(() => setSubmitting(false));
    }
  };

  const handleEdit = (char) => {
    if (!isAuth || char.userId !== userId) {
      return toast.error("You can only edit your own characters");
    }
    setNewCharacter({
      name: char.name,
      image: char.image,
      gender: char.gender,
      world: char.world || "",
    });
    setIsEditing(true);
    setEditId(char.id);
    setShowForm(true);
    setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const handleDelete = (char) => {
    if (!isAuth || char.userId !== userId) {
      return toast.error("You can only delete your own characters");
    }
    const toastId = toast(
      ({ closeToast }) => (
        <div className="p-4 bg-white rounded-lg">
          <p>
            Are you sure you want to delete <strong>{char.name}</strong>?
          </p>
          <div className="flex justify-end space-x-2 mt-3">
            <button
              className="px-3 py-1 bg-red-600 text-white rounded"
              onClick={() => {
                axios
                  .delete(`${API_URL}/${char.id}`)
                  .then(() => {
                    setCharacters((chars) =>
                      chars.filter((c) => c.id !== char.id)
                    );
                    toast.info("Character deleted");
                  })
                  .catch(() => toast.error("Failed to delete character"));
                toast.dismiss(toastId);
              }}
            >
              Yes
            </button>
            <button
              className="px-3 py-1 bg-teal-200 text-teal-700 rounded"
              onClick={() => toast.dismiss(toastId)}
            >
              No
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-teal-50">
        <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  let filtered = characters.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (showMine) filtered = filtered.filter((c) => c.owner === userId);

  return (
    <div className="min-h-screen bg-teal-50 py-12 px-4">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-teal-900">
            Character Gallery
          </h1>
          <p className="mt-2 text-teal-700">
            {isAuth
              ? `Logged in as ${userEmail}`
              : "Please log in to add characters"}
          </p>
        </header>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <div className="relative w-full sm:w-1/3">
            <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-teal-400" />
            <input
              type="text"
              placeholder="Search characters..."
              className="w-full pl-10 pr-10 py-2 bg-white border border-teal-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMine((v) => !v)}
              className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-full shadow hover:bg-teal-700 transition"
            >
              {showMine ? "Show All" : "Show Mine"}
            </button>
            {showForm ? (
              <FiX
                size={28}
                className="cursor-pointer text-teal-600 hover:text-teal-800"
                onClick={handlePlusClick}
              />
            ) : (
              <FiPlus
                size={28}
                className={`cursor-pointer text-teal-600 hover:text-teal-800 ${
                  !isAuth ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handlePlusClick}
              />
            )}
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div
            ref={formRef}
            className="mb-16 bg-white rounded-xl shadow-lg p-8 mx-auto max-w-lg"
          >
            <h2 className="text-2xl font-bold text-teal-900 mb-6 text-center">
              {isEditing ? "Edit Character" : "Add New Character"}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full px-4 py-3 bg-teal-50 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                value={newCharacter.name}
                onChange={(e) =>
                  setNewCharacter({ ...newCharacter, name: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Image URL"
                className="w-full px-4 py-3 bg-teal-50 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                value={newCharacter.image}
                onChange={(e) =>
                  setNewCharacter({ ...newCharacter, image: e.target.value })
                }
              />
              <select
                className="w-full px-4 py-3 bg-teal-50 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                value={newCharacter.gender}
                onChange={(e) =>
                  setNewCharacter({ ...newCharacter, gender: e.target.value })
                }
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <input
                type="text"
                placeholder="World"
                className="w-full px-4 py-3 bg-teal-50 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                value={newCharacter.world}
                onChange={(e) =>
                  setNewCharacter({ ...newCharacter, world: e.target.value })
                }
              />
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`w-full py-3 text-white font-semibold rounded-lg transition ${
                  submitting
                    ? "bg-teal-300 cursor-not-allowed"
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                {submitting
                  ? isEditing
                    ? "Saving..."
                    : "Adding..."
                  : isEditing
                  ? "Save Changes"
                  : "Add Character"}
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filtered.map((char) => (
              <div
                key={char.id}
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-transform transform hover:-translate-y-2"
              >
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={char.image}
                    alt={char.name}
                    className="w-full h-full object-fill group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-5 text-center">
                  <h3 className="text-xl font-semibold text-teal-900">
                    {char.name}
                  </h3>
                  <span
                    className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${
                      char.gender === "male"
                        ? "bg-teal-200 text-teal-800"
                        : "bg-teal-600 text-white"
                    } flex items-center justify-center`}
                  >
                    {char.gender === "male" ? (
                      <IoMdMale className="inline-block mr-1" />
                    ) : (
                      <IoMdFemale className="inline-block mr-1" />
                    )}
                    {char.gender}
                  </span>
                  {char.world && (
                    <p className="mt-2 text-teal-700 flex items-center justify-center space-x-1">
                      <BiWorld />
                      <span>{char.world}</span>
                    </p>
                  )}
                  {isAuth && char.owner === userEmail && (
                    <div className="flex justify-center space-x-4 mt-4">
                      <FiEdit
                        size={20}
                        className="cursor-pointer text-teal-800 hover:text-yellow-800 transition"
                        onClick={() => handleEdit(char)}
                      />
                      <FiTrash
                        size={20}
                        className="cursor-pointer text-teal-800 hover:text-red-600 transition"
                        onClick={() => handleDelete(char)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-teal-800 text-lg mt-12">
            Oops! No characters found.
          </p>
        )}
      </div>
    </div>
  );
}
