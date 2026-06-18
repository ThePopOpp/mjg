"use client";

import { useState } from "react";

export default function EmailOptOutPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/public/email/opt-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <img
            src="https://michaeljgauthier.com/wp-content/uploads/2025/03/MJG_Logo_Black-1.svg"
            alt="Michael J. Gauthier"
            className="mx-auto mb-4 h-12 w-auto"
          />
          <h1 className="text-3xl font-bold text-gray-900">Unsubscribe from Email</h1>
          <p className="mt-2 text-gray-600">Created for More — by Michael J. Gauthier</p>
        </div>

        {status === "success" ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-2xl font-semibold text-gray-800">You&apos;ve been unsubscribed.</p>
            <p className="mt-2 text-gray-600">
              You will no longer receive email communications from Created for More.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Changed your mind?{" "}
              <a href="/email/opt-in" className="underline text-gray-700">Re-subscribe here</a>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-gray-200 p-8">
            <p className="text-sm text-gray-600">
              Enter your email address below to unsubscribe from all email communications
              from Created for More by Michael J. Gauthier.
            </p>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="you@example.com"
              />
            </div>

            {message && status === "error" && (
              <p className="text-sm text-red-600">{message}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {status === "loading" ? "Processing…" : "Unsubscribe"}
            </button>

            <div className="text-xs text-gray-400 space-y-1">
              <p>
                <a href="/email/opt-in" className="underline">Re-subscribe</a> ·{" "}
                <a href="https://michaeljgauthier.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a> ·{" "}
                <a href="https://michaeljgauthier.com/terms" className="underline" target="_blank" rel="noopener noreferrer">Terms of Service</a>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
