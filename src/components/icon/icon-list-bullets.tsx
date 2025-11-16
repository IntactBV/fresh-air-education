export function IconListBullets({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="5" cy="6" r="1.3" fill="currentColor" />
      <circle cx="5" cy="12" r="1.3" fill="currentColor" />
      <circle cx="5" cy="18" r="1.3" fill="currentColor" />
      <path d="M9 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 18h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}