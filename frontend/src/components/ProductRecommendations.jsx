import { useRecommendations } from '../hooks/useProducts';
import ProductCardOptimized from './ProductCardOptimized';
import { ProductListSkeleton } from './ui/Skeleton';

/**
 * Componente de Recomendações Personalizadas
 */
export default function ProductRecommendations() {
  const { products, loading, error } = useRecommendations();

  if (loading) {
    return (
      <section className="py-12 bg-neutral-50 dark:bg-neutral-900">
        <div className="container-responsive">
          <h2 className="text-3xl font-bold mb-8">Recomendado para Você</h2>
          <ProductListSkeleton count={4} />
        </div>
      </section>
    );
  }

  if (error || !products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-neutral-50 dark:bg-neutral-900">
      <div className="container-responsive">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Recomendado para Você</h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Baseado no seu histórico de compras
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCardOptimized key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
