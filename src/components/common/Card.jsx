export default function Card({ children, className = '', padding = true, hover = false, ...props }) {
  // Only apply the default white background when the caller hasn't passed its own bg-* class.
  // Otherwise Tailwind's `bg-white` can win over a custom background (e.g. dark cards),
  // leaving white text invisible on a white card.
  const hasBgOverride = /(^|\s)bg-/.test(className);
  return (
    <div
      className={`${hasBgOverride ? '' : 'bg-white'} rounded-2xl shadow-soft border border-slate-100 overflow-hidden
        ${padding ? 'p-6' : ''}
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
