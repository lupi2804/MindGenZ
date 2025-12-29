import React, { useState } from 'react'

const uid = () => Math.random().toString(36).slice(2,9)+ '-' + Date.now().toString(36)

export default function MoodTracker(){
  const [mood, setMood] = useState('')
  const [note, setNote] = useState('')
  const [list, setList] = useState(()=> JSON.parse(localStorage.getItem('mg_moods') || '[]'))

  function save(){
    if (!mood) return alert('Pilih mood dulu.')
    const rec = { id: uid(), mood, note, created_at: new Date().toISOString() }
    const arr = [rec, ...list].slice(0,100)
    setList(arr)
    localStorage.setItem('mg_moods', JSON.stringify(arr))
    setMood(''); setNote('')
  }

  function remove(id){
    const f = list.filter(l => l.id !== id)
    setList(f); localStorage.setItem('mg_moods', JSON.stringify(f))
  }

  return (
    <section className="bg-white p-6 rounded shadow">
      <h3 className="text-xl font-bold">Mood Tracker</h3>
      <p className="text-sm text-slate-600 mt-1">Catat mood harianmu. Data tersimpan di perangkat.</p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
        <div>
          <label className="block text-sm">Pilih Mood</label>
          <select className="w-full border rounded px-2 py-1" value={mood} onChange={e => setMood(e.target.value)}>
            <option value="">-- Pilih --</option>
            <option value="Happy">Happy</option>
            <option value="Calm">Calm</option>
            <option value="Anxious">Anxious</option>
            <option value="Sad">Sad</option>
            <option value="Angry">Angry</option>
            <option value="Neutral">Neutral</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm">Catatan (opsional)</label>
          <input className="w-full border rounded px-2 py-1" value={note} onChange={e => setNote(e.target.value)} placeholder="Catatan singkat..." />
        </div>
      </div>

      <div className="mt-3">
        <button onClick={save} className="px-4 py-2 bg-emerald-600 text-white rounded">Simpan Mood</button>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold">Riwayat Terbaru</h4>
        {list.length === 0 ? <p className="text-sm text-slate-600 mt-2">Belum ada mood tersimpan.</p> : (
          <ul className="mt-3 space-y-2">
            {list.map(l => (
              <li key={l.id} className="p-3 border rounded flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium">{l.mood} <span className="text-xs text-slate-500">• {new Date(l.created_at).toLocaleString()}</span></div>
                  {l.note && <div className="text-sm text-slate-700 mt-1">{l.note}</div>}
                </div>
                <div>
                  <button onClick={() => remove(l.id)} className="text-xs text-red-600">Hapus</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
