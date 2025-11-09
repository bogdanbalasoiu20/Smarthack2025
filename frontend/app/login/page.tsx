"use client";

import type { SVGProps } from "react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

type LoginResponse = {
  token?: string;
  message?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role?: string | null;
    groups?: string[];
  };
};

const CircleUserIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
    {...props}
  >
    <path d="M399 384.2C376.9 345.8 335.4 320 288 320H224c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z" />
  </svg>
);

const KeyIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" {...props}>
    <path d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V432c0-6.4 2.5-12.5 7-17l199.7-199.7c16.9 5.4 35 8.3 53.7 8.3zM376 176c-26.5 0-48-21.5-48-48s21.5-48 48-48s48 21.5 48 48s-21.5 48-48 48z" />
  </svg>
);

const EyeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m2 2 20 20" />
    <path d="M9.5 9.5a3 3 0 1 0 5 5" />
    <path d="M14.53 14.53A10.94 10.94 0 0 1 12 15c-7 0-11-3-11-3a16.9 16.9 0 0 1 5.06-4.58" />
    <path d="M17.73 9.35A10.46 10.46 0 0 1 23 12s-4 3-11 3a13.76 13.76 0 0 1-2.82-.3" />
  </svg>
);

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
        const userRole =
          data.user?.role ||
          (data.user?.groups && data.user.groups.length > 0
            ? data.user.groups[0]
            : null);
        if (userRole) {
          localStorage.setItem("userRole", userRole);
        } else {
          localStorage.removeItem("userRole");
        }

        if (data.user) {
          const fullName = `${data.user.first_name ?? ""} ${
            data.user.last_name ?? ""
          }`
            .trim()
            .replace(/\s+/g, " ");
          localStorage.setItem(
            "userName",
            fullName.length > 0 ? fullName : data.user.username
          );
        }

        router.push("/dashboard");
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-page flex items-center justify-center">
      <div className="glass-card w-full max-w-xl p-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/5">
            <svg
              className="h-8 w-8 text-indigo-300"
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
          <div>
            <p className="app-pill">Welcome back</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              Sign in to continue
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Access the unified glass workspace across dashboard and editor.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400"
            >
              Username
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
              <CircleUserIcon className="h-5 w-5 text-slate-400" />
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="h-11 flex-1 bg-transparent text-base text-slate-50 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400"
            >
              Password
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
              <KeyIcon className="h-5 w-5 text-slate-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="h-11 flex-1 bg-transparent text-base text-slate-50 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 transition hover:text-slate-200"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
            <label className="inline-flex items-center gap-2">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded-md border-white/30 bg-transparent text-indigo-400 focus:ring-indigo-400"
              />
              Remember me
            </label>
            <a
              href="/forget"
              className="font-medium text-indigo-300 transition hover:text-indigo-100"
            >
              Forgot password?
            </a>
          </div>

          <button type="submit" disabled={isLoading} className="app-button w-full">
            {isLoading ? (
              <span className="flex items-center gap-2 text-sm">
                <svg
                  className="h-4 w-4 animate-spin text-white"
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
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="font-semibold text-indigo-300 transition hover:text-indigo-100"
          >
            Create one
          </a>
        </div>
      </div>
    </div>
  );
}
