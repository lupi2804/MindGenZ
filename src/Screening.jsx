import React, { useState } from "react";

const QUESTIONS = [
  "Apakah kamu sering merasa sedih tanpa sebab?",
  "Apakah kamu kehilangan minat pada hal yang biasa kamu nikmati?",
  "Apakah pola tidurmu berubah (terlalu banyak/terlalu sedikit)?",
  "Apakah kamu sering merasa lelah tanpa sebab?",
  "Apakah kamu merasa sulit berkonsentrasi?",
  "Apakah nafsu makanmu berubah signifikan?",
  "Apakah kamu sering merasa cemas atau khawatir berlebihan?",
  "Apakah kamu mudah marah atau tersinggung?",
  "Apakah kamu memiliki pikiran negatif tentang diri sendiri?",
  "Apakah kamu berpikir untuk menyakiti diri sendiri?"
];

const uid = () =>
  Math.random().toString(36).slice(2, 9) +
  "-" +
  Date.now().toString(36);

export default function Screening() {
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(null));
  const [result, setResult] = useState(null);

  const setAnswer = (i, val) => {
    const copy = [...answers];
    copy[i] = val;
    setAnswers(copy);
  };

  const score = () => answers.reduce((s, v) => s + (v ? 1 : 0), 0);

  const analyze = (s) => {
    if (s <= 2)
      return {
        level: "Normal",
        color: "green",
        desc:
          "Gejala sangat rendah. Tetap jaga pola hidup sehat dan rutin cek kondisi mentalmu.",
        tips: [
          "Tidur cukup 7–8 jam",
          "Journaling sederhana",
          "Kurangi screen-time"
        ]
      };

    if (s <= 5)
      return {
        level: "Sedang",
        color: "yellow",
        desc:
          "Ada beberapa gejala emosional. Kamu mungkin sedang lelah atau tertekan.",
        tips: [
          "Lakukan deep breathing 5 menit",
          "Berbicara dengan teman dekat",
          "Kurangi beban tugas jika memungkinkan"
        ]
      };

    if (s <= 7)
      return {
        level: "Tinggi",
        color: "orange",
        desc:
          "Indikasi stres atau kecemasan cukup tinggi. Sangat disarankan melakukan self-care lebih intens.",
        tips: [
          "Meditasi 10 menit",
          "Batasi media sosial 24 jam",
          "Olahraga ringan 15 menit"
        ]
      };

    return {
      level: "Sangat Tinggi",
      color: "red",
      desc:
        "Gejala emosional serius terdeteksi. Pertimbangkan berkonsultasi dengan profesional.",
      tips: [
        "Hubungi teman/keluarga terdekat",
        "Jangan menyendiri terlalu lama",
        "Cari bantuan profesional secepatnya"
      ]
    };
  };

  const submit = () => {
    if (answers.some((a) => a === null))
      return alert("Harap jawab semua pertanyaan.");

    const s = score();
    const analysis = analyze(s);

    const rec = {
      id: uid(),
      answers,
      score: s,
      result: analysis,
      created_at: new Date().toISOString()
    };

    const key = "mg_screenings";
    const arr = [
      rec,
      ...(JSON.parse(localStorage.getItem(key) || "[]"))
    ].slice(0, 50);

    localStorage.setItem(key, JSON.stringify(arr));
    setResult(rec);
  };

  // --------------------------------------------------------
  //              HALAMAN HASIL (PREMIUM STYLE)
  // --------------------------------------------------------
  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-6 animate-fadeIn">
        <div className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-xl border border-white/50">
          <h2 className="text-2xl font-bold text-slate-900">
            Hasil Screening Kamu
          </h2>

          <div className="mt-4 text-center">
            <div
              className={`text-5xl font-extrabold ${
                result.result.color === "red"
                  ? "text-red-600"
                  : result.result.color === "orange"
                  ? "text-orange-500"
                  : result.result.color === "yellow"
                  ? "text-yellow-500"
                  : "text-green-600"
              }`}
            >
              {result.score}/10
            </div>

            <p className="text-lg font-semibold mt-2">
              Level: {result.result.level}
            </p>
            <p className="text-slate-600 mt-1">{result.result.desc}</p>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Rekomendasi:</h3>
            <ul className="list-disc ml-6 text-slate-700 space-y-1">
              {result.result.tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>

          {/* Warning Khusus */}
          {result.score >= 8 && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              ⚠ Jika kamu merasa tidak aman atau memiliki pikiran menyakiti diri,
              segera hubungi layanan profesional atau orang terdekat.
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setResult(null)}
              className="px-5 py-2 rounded-full bg-indigo-600 text-white shadow hover:scale-105 transition"
            >
              Kembali
            </button>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-5 py-2 rounded-full border bg-white shadow hover:bg-slate-50 transition"
            >
              Cek Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  //                     HALAMAN PERTANYAAN
  // --------------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto p-6 animate-fadeIn pb-20">
      <h2 className="text-2xl font-bold text-slate-900">
        Screening Kesehatan Mental (10 Pertanyaan)
      </h2>
      <p className="text-slate-600 mt-1">
        Jawab sesuai kondisi kamu dalam beberapa minggu terakhir.
      </p>

      {/* Progress bar */}
      <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all"
          style={{
            width: `${
              (answers.filter((a) => a !== null).length / QUESTIONS.length) * 100
            }%`
          }}
        ></div>
      </div>

      <ol className="mt-6 space-y-4">
        {QUESTIONS.map((q, i) => (
          <li
            key={i}
            className="p-5 bg-white/80 backdrop-blur-xl shadow rounded-2xl border border-white/40 animate-slideUp"
          >
            <div className="text-sm font-medium mb-3">
              {i + 1}. {q}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setAnswer(i, true)}
                className={`px-4 py-2 rounded-xl border shadow text-sm ${
                  answers[i] === true
                    ? "bg-indigo-600 text-white"
                    : "bg-white hover:bg-slate-50"
                }`}
              >
                Ya
              </button>

              <button
                onClick={() => setAnswer(i, false)}
                className={`px-4 py-2 rounded-xl border shadow text-sm ${
                  answers[i] === false
                    ? "bg-indigo-600 text-white"
                    : "bg-white hover:bg-slate-50"
                }`}
              >
                Tidak
              </button>
            </div>
          </li>
        ))}
      </ol>

      <button
        onClick={submit}
        className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-full shadow hover:scale-105 transition"
      >
        Lihat Hasil
      </button>
    </div>
  );
}
