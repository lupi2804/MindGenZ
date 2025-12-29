import React from 'react'

export default function Card({ title, children, onClick }) {
  return (
    <div onClick={onClick} className="p-4 bg-white rounded border hover:shadow cursor-pointer">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{children}</p>
    </div>
  )
}
