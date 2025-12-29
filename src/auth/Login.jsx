import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login({ goRegister, goForgot, onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function login() {
    if (!email || !password) {
      alert('Isi email dan password')
      return
    }

    setLoading(true)

    // 1️⃣ Login Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoading(false)
      alert(error.message)
      return
    }

    const user = data.user

    // 2️⃣ Ambil role dari profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    setLoading(false)

    if (profileError) {
      alert(profileError.message)
      return
    }

    // 3️⃣ Login sukses
    onSuccess({
      id: user.id,
      email: user.email,
      role: profile.role,
    })
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold">Login</h2>

      <div className="mt-4 space-y-3">
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
            onClick={login}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>

          <div className="text-sm flex flex-col items-end">
            <button
              onClick={goRegister}
              className="underline text-slate-600"
            >
              Registrasi
            </button>

            <button
              onClick={goForgot}
              className="underline text-slate-600"
            >
              Lupa Password?
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
