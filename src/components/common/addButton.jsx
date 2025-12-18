export default function AddButton({ handleClick, title }) {
  return (
    <button
      onClick={handleClick}
      className="group relative inline-flex items-center justify-center cursor-pointer
        px-6 py-3 text-sm font-semibold text-white
        bg-indigo-600
        rounded-lg shadow-md
        transition-all duration-300
        hover:bg-indigo-700 hover:shadow-lg
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <span
        className="absolute inset-0 rounded-lg bg-white/10 opacity-0
          transition-opacity duration-300 group-hover:opacity-100"
      ></span>

      {/* icon */}
      <svg
        className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-90"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4v16m8-8H4"
        />
      </svg>

      <span className="relative z-10">{title}</span>
    </button>
  );
}
