import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { IoMenu, IoClose } from "react-icons/io5";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [auth, setAuth] = useState(false);
  const [userName, setUserName] = useState("");
  const [UserImage, setUserImage] = useState("");

  // on route change, read initial values
  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated") === "true";
    setAuth(isAuth);
    if (isAuth) {
      setUserName(localStorage.getItem("fullName") || "");
      setUserImage(localStorage.getItem("UserImage") || "");
    }
  }, [pathname]);

  // listen for profile‐update events
  useEffect(() => {
    const onProfileUpdate = () => {
      setUserName(localStorage.getItem("fullName") || "");
      setUserImage(localStorage.getItem("UserImage") || "");
    };
    window.addEventListener("userProfileUpdated", onProfileUpdate);
    return () => {
      window.removeEventListener("userProfileUpdated", onProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    localStorage.removeItem("UserImage");
    setAuth(false);
    navigate("/login");
  };

  const linkClass = (path) =>
    `block px-6 py-3 font-medium rounded-md transition ${
      pathname === path
        ? "bg-white text-teal-600"
        : "text-white hover:bg-white hover:text-teal-600"
    }`;

  return (
    <nav className="bg-teal-600 text-white shadow-md">
      <div className="container-xl mx-auto flex items-center justify-between lg:justify-start gap-4 lg:gap-10 p-4">
        {/* Branding */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="logo.w.svg" alt="Logo" className="h-10" />
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex space-x-4">
          <Link to="/" className={linkClass("/")}>
            Home
          </Link>
          <Link to="/characters" className={linkClass("/characters")}>
            Characters
          </Link>
        </div>

        {/* Auth / Profile */}
        <div className="hidden lg:flex items-center space-x-4 ml-auto">
          {!auth ? (
            <>
              <Link
                to="/register"
                className="px-6 py-3 font-medium rounded-md bg-white text-teal-600 hover:bg-teal-50"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 font-medium rounded-md bg-teal-500 hover:bg-teal-600"
              >
                Login
              </Link>
            </>
          ) : (
            <>
              <span className="py-3 font-medium">{userName}</span>
              <Link to="/profile">
                <img
                  src={UserImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-contain border"
                />
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="lg:hidden focus:outline-none text-white"
        >
          {menuOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`lg:hidden bg-teal-700 overflow-hidden transition-[max-height] duration-300 ${
          menuOpen ? "max-h-screen" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col">
          <li>
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className={linkClass("/")}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/characters"
              onClick={() => setMenuOpen(false)}
              className={linkClass("/characters")}
            >
              Characters
            </Link>
          </li>
        </ul>
        <div className="flex justify-center space-x-4 py-2">
          {!auth ? (
            <>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-3 font-medium rounded-md bg-white text-teal-600 hover:bg-teal-50"
              >
                Register
              </Link>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="px-6 py-3 font-medium rounded-md bg-teal-200 text-teal-800 hover:bg-teal-300"
              >
                Login
              </Link>
            </>
          ) : (
            <>
              <span className="px-3 py-3 font-medium">{userName}</span>
              <Link to="/profile">
                <img
                  src={UserImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-contain border"
                />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
