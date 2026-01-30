import { CATEGORY_LABELS } from '../../utils/constants';
import Input from '../common/Input';

/**
 * Backend events filter: category (id), status, search, page, limit.
 * categories from API: { _id, name, description }[] or use static labels.
 */
export default function EventFilters({ filters, onFilterChange, categories = [] }) {
  const { search = '', category = '', status = '' } = filters;
  const hasCategoriesFromApi = categories.length > 0;
  const staticOptions = Object.entries(CATEGORY_LABELS);

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <Input
        label="Search"
        placeholder="Search by title or description..."
        value={search}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        className="min-w-[220px]"
      />
      <div className="min-w-[200px]">
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800
            focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
            hover:border-slate-300 transition-colors"
        >
          <option value="">All categories</option>
          {hasCategoriesFromApi
            ? categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))
            : staticOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
        </select>
      </div>
      <div className="min-w-[180px]">
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800
            focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
            hover:border-slate-300 transition-colors"
        >
          <option value="">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
    </div>
  );
}
