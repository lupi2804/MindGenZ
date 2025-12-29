'use client'

import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";

// Emoji Mood Options
const MOODS = [
  { icon: "😭", label: "Sedih" },
  { icon: "😐", label: "Netral" },
  { icon: "🙂", label: "Baik" },
  { icon: "🤩", label: "Senang" },
];

export default function AnonCurhat() {
  const [message, setMessage] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===============================
  // FETCH CURHAT PER TANGGAL
  // ===============================
  useEffect(() => {
    async function fetchCurhat() {
      const start = `${selectedDate}T00:00:00`;
      const end = `${selectedDate}T23:59:59`;

      const { data, error } = await supabase
        .from("curhats")
        .select("*")
        .gte("created_at", start)
        .lte("created_at", end)
        .order("created_at", { ascending: false });

      if (!error) setList(data);
    }

    fetchCurhat();
  }, [selectedDate]);

  // ===============================
  // REALTIME LISTENER
  // ===============================
  useEffect(() => {
    const channel = supabase
      .channel("curhat-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "curhats" },
        (payload) => {
          const d = payload.new.created_at.slice(0, 10);
          if (d === selectedDate) {
            setList((prev) => [payload.new, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  // ===============================
  // SUBMIT KE SUPABASE
  // ===============================
  async function submit() {
    if (!message.trim()) return alert("Tulis curhat dulu.");
    if (!selectedMood) return alert("Pilih mood kamu.");

    setLoading(true);

    const { error } = await supabase.from("curhats").insert({
      content: message.trim(),
      mood: selectedMood.label,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setMessage("");
    setSelectedMood(null);
  }

  return (
    <section className="max-w-2xl mx-auto p-6 bg-white/80 rounded-3xl shadow-xl">
      <h3 className="text-2xl font-bold mb-4">Curhat Anonim</h3>

      {/* DATE */}
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="p-2 border rounded-xl"
      />

      {/* MOOD */}
      <div className="flex gap-3 mt-4">
        {MOODS.map((m) => (
          <button
            key={m.label}
            onClick={() => setSelectedMood(m)}
            className={`text-3xl p-2 rounded-full ${
              selectedMood?.label === m.label
                ? "bg-indigo-600 text-white"
                : "bg-white border"
            }`}
          >
            {m.icon}
          </button>
        ))}
      </div>

      {/* TEXT */}
      <textarea
        className="w-full mt-4 p-3 border rounded-2xl"
        placeholder="Tulis curhatmu…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={submit}
        disabled={loading}
        className="mt-3 px-6 py-2 bg-indigo-600 text-white rounded-full"
      >
        {loading ? "Menyimpan..." : "Kirim Curhat"}
      </button>

      {/* LIST */}
      <div className="mt-8 space-y-3">
        {list.length === 0 && (
          <p className="text-slate-500">Belum ada curhat.</p>
        )}

        {list.map((c) => (
          <div key={c.id} className="p-4 bg-white rounded-2xl shadow">
            <div className="text-xl">{MOODS.find(m => m.label === c.mood)?.icon}</div>
            <div className="text-xs text-slate-500">
              {new Date(c.created_at).toLocaleTimeString()}
            </div>
            <p className="mt-1">{c.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
