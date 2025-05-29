import React from "react";
import { Link } from "react-router";
import { FaTwitter, FaDiscord, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-teal-600 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand & Social */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <img
              src="logo.w.svg"
              alt="The Characters API logo"
              className="h-10 w-auto"
            />
            <h3 className="text-2xl font-bold text-white">
              The Characters API
            </h3>
          </div>
          <p className="text-teal-200">
            This website showcases characters from different media.
          </p>
          <div className="flex space-x-4">
            {[FaTwitter, FaDiscord, FaGithub].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="p-2 bg-white rounded-full hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-200 transition"
                aria-label="social link"
              >
                <Icon className="text-teal-600 text-xl" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2">
            {[
              { label: "Home", to: "/" },
              { label: "Characters", to: "/characters" },
            ].map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-teal-200 hover:text-white transition focus:outline-none focus:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-xl font-semibold text-white mb-4">
            Get in Touch
          </h4>
          <p>
            <strong className="text-white">Email:&nbsp;</strong>
            <a
              href="mailto:info@CharactersAPI"
              className="text-teal-200 hover:text-white transition focus:outline-none focus:underline"
            >
              info@CharactersAPI
            </a>
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-teal-500">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-sm text-teal-200">
          &copy; 2025 The Characters API. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
