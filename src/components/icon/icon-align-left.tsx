export function IconAlignLeft({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M4 5h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 10h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 20h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}