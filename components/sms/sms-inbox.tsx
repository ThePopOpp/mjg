"use client";

import { useState, useEffect, useRef } from "react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Search } from "lucide-react";

interface Conversation {
  id: string;
  contact_number: string;
  contact_name: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
  status: string;
  participants: { first_name: string; last_name: string; email: string } | null;
  profiles: { full_name: string; email: string } | null;
}

interface Message {
  id: string;
  direction: "inbound" | "outbound";
  body: string;
  status: string;
  sent_at: string | null;
  delivered_at: string | null;
  created_at: string;
  profiles: { full_name: string } | null;
}

export function SmsInbox() {
  const token = useDashboardActionToken();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 15000);
    return () => clearInterval(interval);
  }, [search]);

  useEffect(() => {
    if (activeConvId) loadThread(activeConvId);
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversations() {
    try {
      const params = new URLSearchParams({ status: "active" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/sms/conversations?${params}`, {
        headers: { "x-mjg-action-token": token ?? "" },
      });
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function loadThread(convId: string) {
    const res = await fetch(`/api/admin/sms/conversations/${convId}`, {
      headers: { "x-mjg-action-token": token ?? "" },
    });
    const data = await res.json();
    setMessages(data.messages ?? []);
    setActiveConv(data.conversation ?? null);
    await loadConversations();
  }

  async function sendReply() {
    if (!replyBody.trim() || !activeConvId || !activeConv) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionToken: token,
          to: activeConv.contact_number,
          body: replyBody.trim(),
          conversationId: activeConvId,
        }),
      });
      if (res.ok) {
        setReplyBody("");
        await loadThread(activeConvId);
      }
    } finally {
      setSending(false);
    }
  }

  function getContactName(conv: Conversation) {
    return conv.contact_name ?? conv.participants
      ? `${conv.participants?.first_name ?? ""} ${conv.participants?.last_name ?? ""}`.trim()
      : conv.profiles?.full_name ?? conv.contact_number;
  }

  function formatTime(iso: string | null) {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-lg border">
      {/* Conversation list */}
      <div className="w-80 shrink-0 flex flex-col border-r">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 h-9 text-sm"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full text-left p-4 border-b hover:bg-accent transition-colors ${
                  activeConvId === conv.id ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">{getContactName(conv)}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {conv.unread_count > 0 && (
                      <Badge className="h-5 px-1.5 text-xs">{conv.unread_count}</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{formatTime(conv.last_message_at)}</span>
                  </div>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground truncate">{conv.last_message_preview ?? conv.contact_number}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Thread view */}
      <div className="flex-1 flex flex-col">
        {!activeConvId ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select a conversation to view messages
          </div>
        ) : (
          <>
            <div className="p-4 border-b flex items-center gap-3">
              <div>
                <p className="font-medium text-sm">{activeConv ? getContactName(activeConv) : ""}</p>
                <p className="text-xs text-muted-foreground">{activeConv?.contact_number}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                      msg.direction === "outbound"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                    <p className={`mt-1 text-xs ${msg.direction === "outbound" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {formatTime(msg.sent_at ?? msg.created_at)}
                      {msg.direction === "outbound" && msg.status === "delivered" ? " · Delivered" : ""}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                  maxLength={1600}
                />
                <Button onClick={sendReply} disabled={sending || !replyBody.trim()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground text-right">{replyBody.length}/1600</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
