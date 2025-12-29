import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function EducationList() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("mg_favs") || "[]"));

  useEffect(() => {
    fetch("/articles.json")
      .then((r) => r.json())
      .then((data) => setArticles(data))
      .catch(() => setArticles([]));
  }, []);

  useEffect(() => {
    localStorage.setItem("mg_favs", JSON.stringify(favorites));
  }, [favorites]);

  const categories = ["Semua", ...Array.from(new Set(articles.map(a => a.category)))];

  const toggleFav = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [id, ...prev]);
  };

  const filtered = articles.filter(a => {
    const matchCategory = filter === "Semua" || a.category === filter;
    const q = search.trim().toLowerCase();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari artikel..." className="flex-1 px-4 py-3 rounded-xl bg-white/60 backdrop-blur-lg" />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-4 py-3 rounded-xl bg-white/60">
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map(a => (
          <div key={a.id} className="flex gap-4 p-4 rounded-2xl shadow-lg items-center bg-white/80">
            <img src={a.img} alt={a.title} className="w-28 h-20 object-cover rounded-lg" />
            <div className="flex-1">
              <Link to={`/edu/${a.id}`} className="text-lg font-semibold text-slate-800 hover:underline">{a.title}</Link>
              <p className="text-sm text-slate-600">{a.desc}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded-full">{a.category}</span>
              </div>
            </div>
            <div>
              <button onClick={() => toggleFav(a.id)} className="px-3 py-2 rounded-lg bg-white border">
                {favorites.includes(a.id) ? "★ Favorit" : "☆ Simpan"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
