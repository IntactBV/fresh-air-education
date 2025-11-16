export function IconListNumbered({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M4.5 5.5h1.5v5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4.5 12.5h2.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4.5 18.5h2.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 18h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}