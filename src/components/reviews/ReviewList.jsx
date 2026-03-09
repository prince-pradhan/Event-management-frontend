import { Star } from 'lucide-react';

function ReviewCard({ review }) {
  const userName = review.user?.name || 'Anonymous';
  const userInitial = userName.charAt(0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
            {userInitial}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{userName}</p>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'text-amber-400 fill-current' : 'text-slate-300'}`} />
              ))}
            </div>
          </div>
        </div>
        <span className="text-sm text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</span>
      </div>
      {review.comment && <p className="mt-4 text-slate-600">{review.comment}</p>}
    </div>
  );
}

export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
        <p className="text-slate-500">No reviews yet for this event.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewCard key={review._id} review={review} />
      ))}
    </div>
  );
}
