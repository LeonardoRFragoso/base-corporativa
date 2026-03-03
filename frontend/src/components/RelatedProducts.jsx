import { useRelatedProducts } from '../hooks/useProducts';
import ProductCardOptimized from './ProductCardOptimized';
import { ProductListSkeleton } from './ui/Skeleton';

/**
 * Componente de Produtos Relacionados
 */
export default function RelatedProducts({ productId }) {
  const { products, loading, error } = useRelatedProducts(productId);

  if (loading) {
    return (
      <section className="py-12">
        <div className="container-responsive">
          <h2 className="text-3xl font-bold mb-8">Produtos Relacionados</h2>
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
        <h2 className="text-3xl font-bold mb-8">Produtos Relacionados</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCardOptimized key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
