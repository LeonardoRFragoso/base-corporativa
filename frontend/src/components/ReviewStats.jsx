import { useReviewStats } from '../hooks/useReviews';
import { Star } from 'lucide-react';
import Skeleton from './ui/Skeleton';

/**
 * Componente de Estatísticas de Reviews
 */
export default function ReviewStats({ productId }) {
  const { stats, loading, error } = useReviewStats(productId);

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 space-y-4">
        <Skeleton variant="title" width="60%" />
        <Skeleton count={5} />
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  const { total_reviews, average_rating, rating_distribution, percentage_distribution } = stats;

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6">
      <h3 className="text-2xl font-bold mb-6">Avaliações dos Clientes</h3>

      {/* Resumo */}
      <div className="flex items-center gap-6 mb-8 pb-8 border-b border-neutral-200 dark:border-neutral-700">
        <div className="text-center">
          <div className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            {average_rating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={`${
                  star <= Math.round(average_rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-neutral-300 dark:text-neutral-600'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {total_reviews} {total_reviews === 1 ? 'avaliação' : 'avaliações'}
          </div>
        </div>

        {/* Distribuição */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium">{stars}</span>
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
              </div>
              
              <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-500"
                  style={{ width: `${percentage_distribution[stars]}%` }}
                />
              </div>
              
              <div className="w-12 text-sm text-neutral-600 dark:text-neutral-400 text-right">
                {percentage_distribution[stars].toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {rating_distribution['5']}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            5 Estrelas
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {rating_distribution['4']}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            4 Estrelas
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">
            {rating_distribution['3']}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            3 Estrelas
          </div>
        </div>
      </div>
    </div>
  );
}
