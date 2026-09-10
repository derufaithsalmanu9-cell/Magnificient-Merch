"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login gagal.");
        setLoading(false);
        return;
      }

      window.location.href = "/admin";
    } catch {
      setError("Tidak dapat terhubung ke server.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-600">
          Magnificent
        </p>

        <h1 className="mt-3 text-4xl font-black">
          ADMIN LOGIN.
        </h1>

        <p className="mt-3 text-sm text-black/50">
          Masuk ke dashboard pengelolaan merchandise.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="text-sm font-bold">
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username admin"
            className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black"
            required
          />
        </div>

        <div>
          <label className="text-sm font-bold">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-black"
            required
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-5 py-4 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? "MEMPROSES..." : "LOGIN →"}
        </button>
      </form>
    </div>
  );
}