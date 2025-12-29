import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function EducationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mg_comments")) || {};
    } catch {
      return {};
    }
  });

  const [summary, setSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [favorite, setFavorite] = useState(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("mg_favs")) || [];
      return favs.includes(Number(id));
    } catch {
      return false;
    }
  });

  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll progress bar
  useEffect(() => {
    const handleScroll = () => {
      const articleHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;

      setScrollProgress((scrolled / articleHeight) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch Article
  useEffect(() => {
    fetch("/articles.json")
      .then((r) => r.json())
      .then((data) => {
        setAllArticles(data);
        const found = data.find((a) => String(a.id) === String(id));
        setArticle(found || null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Favorite toggle
  const toggleFavorite = () => {
    const favs = JSON.parse(localStorage.getItem("mg_favs")) || [];
    let updated;

    if (favorite) {
      updated = favs.filter((x) => x !== Number(id));
    } else {
      updated = [...favs, Number(id)];
    }

    localStorage.setItem("mg_favs", JSON.stringify(updated));
    setFavorite(!favorite);
  };

  const saveComments = (data) => {
    localStorage.setItem("mg_comments", JSON.stringify(data));
    setComments(data);
  };

  const submitComment = () => {
    if (!comment.trim()) return alert("Komentar tidak boleh kosong.");

    const all = JSON.parse(localStorage.getItem("mg_comments") || "{}");
    const entry = { text: comment, at: new Date().toISOString() };

    all[id] = [entry, ...(all[id] || [])];
    saveComments(all);
    setComment("");
  };

  const shareWhatsApp = () => {
    const url = window.location.href;
    const text = encodeURIComponent(`${article?.title}\n\nBaca: ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareInstagram = () => {
    navigator.clipboard.writeText(window.location.href);
    window.open("https://www.instagram.com/", "_blank");
  };

  const simpleSummarize = (text) => {
    if (!text) return "";
    const sentences = text.split(/[.?!]\s+/);
    return (
      sentences.slice(0, 3).join(". ") +
      (sentences.length > 3 ? "…" : "")
    );
  };

  const requestAiSummary = () => {
    setAiLoading(true);
    setSummary("");

    setTimeout(() => {
      setSummary(simpleSummarize(article?.content || ""));
      setAiLoading(false);
    }, 700);
  };

  if (loading)
    return (
      <div className="text-center p-10 text-lg text-slate-600">
        Memuat artikel…
      </div>
    );

  if (!article)
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold mb-4">Artikel tidak ditemukan</h2>
        <button onClick={() => navigate("/edu")} className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-md">
          Kembali
        </button>
      </div>
    );

  const artComments = comments[id] || [];

  // Related Articles (3 random with same category)
  const related = allArticles
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, 3);

  return (
    <div className="pb-32 animate-fadeIn">

      {/* 🔵 Floating Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 z-50 transition-all"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* HERO IMAGE */}
      <div className="w-full h-64 mb-6 relative rounded-3xl overflow-hidden shadow-xl animate-slideUp">
        <img src={article?.img} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full text-white shadow-lg hover:bg-white/40 transition"
        >
          ← Kembali
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-3xl mx-auto px-5">

        {/* Title + Category */}
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{article?.title}</h1>
        <span className="px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
          {article?.category}
        </span>

        {/* PREMIUM ACTIONS */}
        <div className="flex gap-3 mt-4 mb-6">
          <button
            onClick={toggleFavorite}
            className={`px-4 py-2 rounded-full shadow ${
              favorite
                ? "bg-red-500 text-white animate-heartBeat"
                : "bg-white border text-red-500"
            }`}
          >
            {favorite ? "❤️ Favorit" : "🤍 Simpan"}
          </button>

          <button
            onClick={shareWhatsApp}
            className="px-4 py-2 bg-green-500 text-white rounded-full shadow hover:scale-105 transition"
          >
            WhatsApp
          </button>

          <button
            onClick={shareInstagram}
            className="px-4 py-2 bg-pink-500 text-white rounded-full shadow hover:scale-105 transition"
          >
            Instagram
          </button>
        </div>

        {/* ARTICLE BODY */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/40 mb-8 animate-slideUp">
          {article?.content
            ?.split("\n")
            .map((p, i) => (
              <p key={i} className="text-slate-800 leading-relaxed mb-3">
                {p}
              </p>
            ))}
        </div>

        {/* AI SUMMARY */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/40 mb-8 animate-slideUp">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">AI Summary</h3>
            <button
              onClick={requestAiSummary}
              className="px-4 py-2 bg-indigo-600 text-white rounded-full shadow hover:scale-105 transition"
            >
              {aiLoading ? "Meringkas..." : "Ringkas"}
            </button>
          </div>

          <p className="mt-3 text-slate-700">
            {summary
              ? summary
              : "Klik tombol untuk menghasilkan ringkasan AI."}
          </p>
        </div>

        {/* RELATED ARTICLES */}
        {related.length > 0 && (
          <div className="mb-10 animate-slideUp">
            <h3 className="font-semibold text-lg mb-3">Artikel Terkait</h3>

            <div className="flex gap-4 overflow-x-auto pb-2">
              {related.map((a) => (
                <Link
                  key={a.id}
                  to={`/edu/${a.id}`}
                  className="min-w-[200px] bg-white/70 backdrop-blur-xl rounded-2xl shadow p-3 border border-white/40"
                >
                  <img
                    src={a.img}
                    className="w-full h-28 object-cover rounded-xl mb-2"
                  />
                  <div className="font-semibold text-slate-800">{a.title}</div>
                  <div className="text-sm text-slate-500">{a.category}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* COMMENTS */}
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border border-white/40 animate-slideUp">
          <h3 className="font-semibold text-lg mb-3">Komentar</h3>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="3"
            className="w-full p-4 rounded-2xl border bg-white/60 outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="Tulis komentar…"
          />

          <div className="flex gap-3 mt-3">
            <button
              onClick={submitComment}
              className="px-6 py-2 bg-blue-600 text-white rounded-full shadow hover:scale-105 transition"
            >
              Kirim
            </button>
            <button
              onClick={() => setComment("")}
              className="px-6 py-2 border rounded-full shadow"
            >
              Batal
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {artComments.length === 0 ? (
              <p className="text-slate-400 text-sm">Belum ada komentar.</p>
            ) : (
              artComments.map((c, i) => (
                <div
                  key={i}
                  className="p-4 bg-white/60 rounded-2xl border shadow-sm"
                >
                  <div className="text-xs text-slate-500 mb-1">
                    {new Date(c.at).toLocaleString()}
                  </div>
                  <div className="text-slate-800">{c.text}</div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* FLOATING BOTTOM BAR */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl shadow-2xl px-6 py-3 flex gap-6 rounded-full border border-white/40 z-50 animate-slideUp">
        
        <button onClick={toggleFavorite} className="text-xl">
          {favorite ? "❤️" : "🤍"}
        </button>

        <button onClick={shareWhatsApp} className="text-xl">
          📤
        </button>

        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xl">
          ⬆️
        </button>

        <button onClick={requestAiSummary} className="text-xl">
          🤖
        </button>

      </div>
    </div>
  );
}
