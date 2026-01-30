export default function Input({
  label,
  type = 'text',
  error,
  className = '',
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full px-4 py-3 rounded-xl border bg-white text-slate-800 placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
          transition-shadow duration-200
          ${error ? 'border-red-400' : 'border-slate-200 hover:border-slate-300'}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}
