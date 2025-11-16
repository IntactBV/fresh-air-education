export function IconQuote({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M9 6H5a1 1 0 0 0-1 1v5c0 .552.448 1 1 1h3v3h2v-8a2 2 0 0 0-2-2Zm10 0h-4a1 1 0 0 0-1 1v5c0 .552.448 1 1 1h3v3h2v-8a2 2 0 0 0-2-2Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}