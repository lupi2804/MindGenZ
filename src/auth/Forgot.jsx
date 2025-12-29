import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Forgot({ goLogin }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendReset() {
    if (!email) {
      alert('Masukkan email terlebih dahulu')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/reset-password',
    })

    setLoading(false)

    if (error) {
      alert(error.message)
    } else {
      alert('Link reset password telah dikirim ke email kamu.')
      goLogin()
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold">Lupa Password</h2>

      <div className="mt-4 space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Email terdaftar"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <div className="flex justify-between items-center">
          <button
            onClick={sendReset}
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white rounded"
          >
            {loading ? 'Mengirim...' : 'Kirim Link'}
          </button>

          <button
            onClick={goLogin}
            className="underline text-slate-600"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  )
}
