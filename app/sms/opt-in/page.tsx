"use client";

import { useState } from "react";

export default function SmsOptInPage() {
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      setMessage("Please agree to the terms before subscribing.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/public/sms/opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, firstName }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("You're subscribed! Reply STOP at any time to opt out.");
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
          <h1 className="text-3xl font-bold text-gray-900">Subscribe to SMS Updates</h1>
          <p className="mt-2 text-gray-600">Created for More — by Michael J. Gauthier</p>
        </div>

        {status === "success" ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
            <p className="text-2xl font-semibold text-green-800">You&apos;re subscribed!</p>
            <p className="mt-2 text-green-700">
              You&apos;ll receive occasional SMS messages from the Created for More program.
              Reply <strong>STOP</strong> at any time to unsubscribe.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-gray-200 p-8">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First name (optional)
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="Your first name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Mobile phone number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="flex items-start gap-3">
              <input
                id="agreed"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-gray-900"
              />
              <label htmlFor="agreed" className="text-sm text-gray-600">
                I agree to receive SMS messages from Created for More by Michael J. Gauthier.
                Message frequency varies. Message and data rates may apply. Reply{" "}
                <strong>STOP</strong> to unsubscribe, <strong>HELP</strong> for help.
              </label>
            </div>

            {message && status === "error" && (
              <p className="text-sm text-red-600">{message}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {status === "loading" ? "Subscribing…" : "Subscribe to SMS"}
            </button>

            <div className="rounded-md bg-gray-50 p-4 text-xs text-gray-500 space-y-1">
              <p><strong>Program:</strong> Created for More — SMS Updates</p>
              <p><strong>Sender:</strong> Michael J. Gauthier (+1 480-439-3335)</p>
              <p><strong>Message types:</strong> Program updates, event reminders, and encouragement</p>
              <p><strong>Frequency:</strong> Occasional (no more than a few times per month)</p>
              <p>
                Reply <strong>STOP</strong> to unsubscribe ·{" "}
                Reply <strong>HELP</strong> for support ·{" "}
                <a href="/sms/opt-out" className="underline">Opt-Out Page</a> ·{" "}
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
