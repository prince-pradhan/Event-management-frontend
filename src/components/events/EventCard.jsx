import { Link } from 'react-router-dom';
import Card from '../common/Card';
import { getCategoryLabel } from '../../utils/constants';

/**
 * Event shape from backend: title, description, category (populated: name, description),
 * organizer (populated: name, email), location { venue, address, city }, startDate, endDate,
 * totalSeats, availableSeats, price, status, bannerImage, _id
 */
export default function EventCard({ event }) {
  const { _id, title, description, startDate, location, category, bannerImage, status } = event;
  const bannerUrl = typeof bannerImage === 'string' ? bannerImage : bannerImage?.url;
  const categoryLabel = getCategoryLabel(category);
  const date = startDate
    ? new Date(startDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

  return (
    <Link to={`/events/${_id}`} className="block h-full">
      <Card padding={false} hover className="h-full flex flex-col">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={title}
            className="w-full h-44 object-cover rounded-t-2xl"
          />
        ) : (
          <div className="w-full h-44 rounded-t-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-600 font-bold text-lg">
            {categoryLabel}
          </div>
        )}
        <div className="p-5 flex-1 flex flex-col">
          <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
            {categoryLabel}
          </span>
          <h3 className="mt-1.5 font-bold text-slate-900 line-clamp-2 text-lg">{title}</h3>
          {description && (
            <p className="mt-2 text-sm text-slate-600 line-clamp-2">{description}</p>
          )}
          <div className="mt-auto pt-4 flex justify-between text-sm text-slate-500">
            <span>{date}</span>
            {location?.venue && <span className="truncate ml-2">{location.venue}</span>}
          </div>
        </div>
      </Card>
    </Link>
  );
}
