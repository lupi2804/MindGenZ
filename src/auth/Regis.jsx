import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Register({ goLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function register() {
    if (!email || !password) {
      alert('Isi email dan password')
      return
    }

    setLoading(true)

    // 1️⃣ Sign Up ke Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (error) {
      setLoading(false)
      alert(error.message)
      return
    }

    const user = data.user

    // 2️⃣ Tentukan role
    const role = email.endsWith('@mindgenz.com') ? 'admin' : 'user'

    // 3️⃣ Simpan ke tabel profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email,
        role,
      })

    setLoading(false)

    if (profileError) {
      alert(profileError.message)
    } else {
      alert('Registrasi berhasil, silakan login')
      goLogin()
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold">Registrasi</h2>

      <div className="mt-4 space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Nama (opsional)"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <div className="flex justify-between items-center">
          <button
            onClick={register}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 text-white rounded"
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>

          <button
            onClick={goLogin}
            className="underline text-slate-600"
          >
            Sudah punya akun? Login
          </button>
        </div>
      </div>
    </div>
  )
}
