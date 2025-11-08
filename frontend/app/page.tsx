"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/hello/")
      .then(res => res.json())
      .then(data => setMessage(data.message));
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">Next.js + Django 🚀</h1>
      <p className="mt-4 text-lg">{message}</p>
    </main>
  );
}