import React from 'react'

export default function NavButton({ children, active, onClick, to, ...props }) {
  return (
    <button {...props} onClick={onClick} className="px-4 py-2 rounded-xl bg-white/90 text-slate-800 shadow-sm">
      {children}
    </button>
  );
}


