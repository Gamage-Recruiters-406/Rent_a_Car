export function ChevronIcon({ open }) {
  return (
    <svg
      className={`w-5 h-5 text-[#0b2b5a] transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function GearIcon() {
  return (
    <svg
      className="w-5 h-5 text-[#0b2b5a]"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M11.983 1.055a1 1 0 00-1.966 0l-.153.77a7.7 7.7 0 00-1.45.6l-.7-.39a1 1 0 00-1.366.366l-.9 1.558a1 1 0 00.366 1.366l.7.39a7.7 7.7 0 000 1.2l-.7.39a1 1 0 00-.366 1.366l.9 1.558a1 1 0 001.366.366l.7-.39c.46.26.944.46 1.45.6l.153.77a1 1 0 001.966 0l.153-.77c.506-.14.99-.34 1.45-.6l.7.39a1 1 0 001.366-.366l.9-1.558a1 1 0 00-.366-1.366l-.7-.39a7.7 7.7 0 000-1.2l.7-.39a1 1 0 00.366-1.366l-.9-1.558a1 1 0 00-1.366-.366l-.7.39a7.7 7.7 0 00-1.45-.6l-.153-.77zM10 12.25A2.25 2.25 0 1010 7.75a2.25 2.25 0 000 4.5z" />
    </svg>
  );
}
