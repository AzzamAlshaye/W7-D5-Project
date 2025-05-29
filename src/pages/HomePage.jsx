import React from "react";
import { Link } from "react-router";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-teal-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative flex-1 bg-teal-50 text-teal-800 flex flex-col items-center justify-center px-6 lg:px-80 py-12">
        {/* Faded background logo */}
        <img
          src="logo-theme.svg"
          alt="Logo background"
          className="absolute inset-0 m-auto w-2/3 h-2/3 object-contain opacity-10 pointer-events-none"
        />

        {/* Foreground content */}
        <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
            Welcome to the Characters API
          </h1>
          <p className="text-sm sm:text-base md:text-lg max-w-2xl text-teal-800">
            Explore detailed profiles of your favorite TV characters—including
            names, images, and gender—all in one place.
          </p>
          <Link
            to="/characters"
            className="inline-block mt-4 bg-teal-600 text-teal-100 font-semibold py-3 px-8 rounded-full shadow-lg transform transition duration-200 hover:scale-105 hover:bg-teal-50 hover:text-teal-700"
          >
            Check Characters
          </Link>
        </div>
      </section>

      {/* Footer CTA or additional section can go here */}
    </main>
  );
}
