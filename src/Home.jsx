import React from 'react'
import Card from './components/Card'

export default function Home() {
  return (
    <div className="text-center space-y-6">

      <h2 className="text-3xl font-bold text-white drop-shadow">Selamat datang 👋</h2>
      <p className="text-white/90">Bagaimana perasaanmu hari ini?</p>

      <div className="grid grid-cols-2 gap-4 mt-6">
        {/* CARD 1 */}
        <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-lg shadow-lg hover:scale-[1.02] transition cursor-pointer">
          <h3 className="font-bold text-lg">Screening Cepat</h3>
          <p className="text-sm text-slate-700">10 pertanyaan singkat</p>
        </div>

        {/* CARD 2 */}
        <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-lg shadow-lg hover:scale-[1.02] transition cursor-pointer">
          <h3 className="font-bold text-lg">Mood Tracker</h3>
          <p className="text-sm text-slate-700">Catat suasana hati</p>
        </div>

        {/* CARD 3 */}
        <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-lg shadow-lg hover:scale-[1.02] transition cursor-pointer">
          <h3 className="font-bold text-lg">Edukasi Singkat</h3>
          <p className="text-sm text-slate-700">Artikel mental health</p>
        </div>

        {/* CARD 4 */}
        <div className="p-6 rounded-2xl bg-white/50 backdrop-blur-lg shadow-lg hover:scale-[1.02] transition cursor-pointer">
          <h3 className="font-bold text-lg">Curhat Anonim</h3>
          <p className="text-sm text-slate-700">Tulis perasaanmu</p>
        </div>
      </div>
    </div>
  );
}
