import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("mg_favs") || "[]");
    setFavorites(favs);

    fetch("/articles.json")
      .then((r) => r.json())
      .then((data) => setArticles(data));
  }, []);

  const favArticles = articles.filter((a) => favorites.includes(a.id));

  const toggleFavorite = (id) => {
    const favs = JSON.parse(localStorage.getItem("mg_favs") || "[]");
    let updated;

    if (favs.includes(id)) {
      updated = favs.filter((x) => x !== id);
    } else {
      updated = [...favs, id];
    }

    localStorage.setItem("mg_favs", JSON.stringify(updated));
    setFavorites(updated);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fadeIn pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Favorit</h1>
        <Link
          to="/edu"
          className="px-4 py-2 bg-indigo-600 text-white rounded-full shadow"
        >
          Edukasi
        </Link>
      </div>

      {favArticles.length === 0 && (
        <div className="text-center mt-16">
          <div className="text-6xl mb-4">🤍</div>
          <p className="text-slate-500 text-lg">
            Kamu belum menyimpan artikel apa pun.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {favArticles.map((a) => (
          <div
            key={a.id}
            className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-lg overflow-hidden animate-slideUp"
          >
            <Link to={`/edu/${a.id}`}>
              <img
                src={a.img}
                className="w-full h-28 object-cover rounded-t-2xl"
                alt={a.title}
              />
            </Link>

            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                  {a.category}
                </span>

                <button
                  onClick={() => toggleFavorite(a.id)}
                  className="text-2xl hover:scale-110 transition"
                >
                  ❤️
                </button>
              </div>

              <Link to={`/edu/${a.id}`}>
                <h2 className="font-semibold text-lg mt-3">{a.title}</h2>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                  {a.desc}
                </p>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="h-10"></div>
    </div>
  );
}
