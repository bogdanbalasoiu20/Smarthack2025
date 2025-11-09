"use client";

import { useState, FormEvent } from "react";
// Nu mai avem nevoie de useRouter dacă afișăm un mesaj de succes pe loc
// import { useRouter } from "next/navigation";

// --- Iconițe SVG ---
// Am adăugat EnvelopeIcon și CheckCircleIcon pentru noua interfață

// Iconiță pentru câmpul de email (bazată pe FontAwesome 'fa-envelope')
const EnvelopeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
    {...props}
  >
    <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z" />
  </svg>
);

// Iconiță pentru mesajul de succes (bazată pe FontAwesome 'fa-circle-check')
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
    {...props}
  >
    <path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM371.8 211.8l-128 128c-6.2 6.2-16.4 6.2-22.6 0l-64-64c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L232 305.4l116.7-116.7c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" />
  </svg>
);
// --- Sfârșit Iconițe SVG ---

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const router = useRouter(); // Nu este folosit momentan

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage(""); // Resetează mesajele la fiecare trimitere
    setIsLoading(true);

    try {
      // TODO: Înlocuiește cu endpoint-ul tău real pentru resetarea parolei
      const response = await fetch(
        "http://127.0.0.1:8000/api/password-reset/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Afișează un mesaj de succes în loc să redirecționezi
        setSuccessMessage(
          "If an account with that email exists, a password reset link has been sent. Please check your inbox."
        );
      } else {
        setError(data.message || "Failed to send reset link. Please try again.");
      }
    } catch (err) {
      setError("An network error occurred. Please try again.");
      console.error("Password reset error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-page flex items-center justify-center">
      <div className="glass-card w-full max-w-md p-8 sm:p-12">
        {/* Placeholder pentru Logo (păstrat din modelul tău) */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6-6v6m12-6v6M12 6a3 3 0 100-6 3 3 0 000 6zM6 9a3 3 0 100-6 3 3 0 000 6zm12 0a3 3 0 100-6 3 3 0 000 6z"
              ></path>
            </svg>
          </div>
        </div>

        {/* --- Conținutul se schimbă în funcție de starea de succes --- */}
        {successMessage ? (
          <div className="text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white mt-6">
              Check Your Email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              {successMessage}
            </p>
            <div className="mt-8">
              <a
                href="/login" // Modifică acest link dacă e necesar
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                Back to Sign In
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Titlu și Subtitlu pentru formular */}
            <div>
              <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                Forgot Password?
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                No problem. Enter your email to get a reset link.
              </p>
            </div>

            {/* Formularul de Resetare */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm transition-opacity duration-300">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                {/* Câmpul Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none relative block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Butonul de Trimitere */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-in-out shadow-md hover:shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
            </form>

            {/* Link de întoarcere la Login */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remember your password?{" "}
                <a
                  href="/login" // Modifică acest link dacă e necesar
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  Sign in
                </a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
