import React from 'react'

export default function NavButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-sm ${active ? 'bg-slate-800 text-white' : 'bg-white border'}`}
    >
      {children}
    </button>
  )
}
