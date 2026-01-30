export default function Card({ children, className = '', padding = true, hover = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden
        ${padding ? 'p-6' : ''}
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
