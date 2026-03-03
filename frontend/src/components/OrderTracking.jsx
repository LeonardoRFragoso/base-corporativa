import { useOrderTracking } from '../hooks/useOrders';
import { Check, Package, Truck, MapPin } from 'lucide-react';
import Skeleton from './ui/Skeleton';
import Badge from './ui/Badge';

/**
 * Componente de Rastreamento de Pedido
 */
export default function OrderTracking({ orderId }) {
  const { tracking, loading, error } = useOrderTracking(orderId);

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6">
        <Skeleton variant="title" className="mb-6" />
        <Skeleton count={4} />
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 text-center">
        <p className="text-neutral-600 dark:text-neutral-400">
          Não foi possível carregar o rastreamento
        </p>
      </div>
    );
  }

  const statusIcons = {
    pending: Package,
    paid: Check,
    shipped: Truck,
    delivered: MapPin
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Rastreamento do Pedido</h3>
        <Badge variant={
          tracking.status === 'delivered' ? 'success' :
          tracking.status === 'shipped' ? 'info' :
          tracking.status === 'paid' ? 'primary' :
          'default'
        }>
          {tracking.status === 'delivered' ? 'Entregue' :
           tracking.status === 'shipped' ? 'Em Transporte' :
           tracking.status === 'paid' ? 'Pago' :
           'Pendente'}
        </Badge>
      </div>

      {/* Código de Rastreamento */}
      {tracking.tracking_code && (
        <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl">
          <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
            Código de Rastreamento
          </div>
          <div className="font-mono font-bold text-lg">
            {tracking.tracking_code}
          </div>
          {tracking.carrier && (
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Transportadora: {tracking.carrier}
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {tracking.timeline.map((item, index) => {
          const Icon = statusIcons[item.status] || Package;
          const isCompleted = item.completed;
          const isLast = index === tracking.timeline.length - 1;

          return (
            <div key={item.status} className="flex gap-4">
              {/* Icon */}
              <div className="flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all
                  ${isCompleted 
                    ? 'bg-primary-600 text-white shadow-lg' 
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400'
                  }
                `}>
                  <Icon size={24} />
                </div>
                {!isLast && (
                  <div className={`
                    w-0.5 h-16 mt-2
                    ${isCompleted 
                      ? 'bg-primary-600' 
                      : 'bg-neutral-200 dark:bg-neutral-700'
                    }
                  `} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className={`
                  font-semibold mb-1
                  ${isCompleted 
                    ? 'text-neutral-900 dark:text-white' 
                    : 'text-neutral-400 dark:text-neutral-600'
                  }
                `}>
                  {item.label}
                </div>
                {item.date && (
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {item.date}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Estimativa de Entrega */}
      {tracking.estimated_delivery && (
        <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
          <div className="text-sm text-primary-800 dark:text-primary-300 mb-1">
            Previsão de Entrega
          </div>
          <div className="font-semibold text-primary-900 dark:text-primary-200">
            {tracking.estimated_delivery}
          </div>
        </div>
      )}
    </div>
  );
}
