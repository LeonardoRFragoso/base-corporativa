import { useState } from 'react';
import { formatBRL } from '../utils/format';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

const OrderModal = ({ order, onClose, onOrderUpdate }) => {
  const [trackingCode, setTrackingCode] = useState(order?.tracking_code || '');
  const [showTrackingInput, setShowTrackingInput] = useState(false);
  
  if (!order) return null;

  const updateOrderStatus = async (newStatus, withTracking = false) => {
    try {
      const statusLabels = {
        pending: 'Pendente',
        paid: 'Pago',
        shipped: 'Enviado',
        delivered: 'Entregue',
        failed: 'Falhou',
        canceled: 'Cancelado'
      };
      
      const ok = confirm(`Confirmar alteração do status do pedido #${order.id} para "${statusLabels[newStatus]}"?`);
      if (!ok) return;
      
      const payload = { status: newStatus };
      if (withTracking && trackingCode) {
        payload.tracking_code = trackingCode;
      }
      
      await api.patch(`/api/orders/${order.id}/status/`, payload);
      toast.success('Status atualizado com sucesso!');
      
      if (onOrderUpdate) {
        onOrderUpdate();
      }
      onClose();
    } catch (e) {
      toast.error('Falha ao atualizar status.');
      console.error(e);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Pago' },
      shipped: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Enviado' },
      delivered: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Entregue' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Falhou' },
      canceled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelado' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">Pedido #{order.id}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-neutral-400 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status e Data */}
          <div className="flex items-center justify-between">
            {getStatusBadge(order.status)}
            <span className="text-sm text-gray-500 dark:text-neutral-500">
              {new Date(order.created_at).toLocaleString('pt-BR')}
            </span>
          </div>

          {/* Informações do Cliente */}
          <div className="bg-gray-50 dark:bg-neutral-900 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-neutral-100 mb-2">Cliente</h3>
            <p className="text-gray-700 dark:text-neutral-300">{order.first_name || ''} {order.last_name || ''}</p>
            <p className="text-gray-600 dark:text-neutral-400 text-sm">{order.email || 'Email não informado'}</p>
          </div>

          {/* Itens do Pedido */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-neutral-100 mb-3">Itens do Pedido</h3>
            <div className="space-y-2">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-900 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-neutral-100">{item.product_name}</p>
                    <p className="text-sm text-gray-600 dark:text-neutral-400">Quantidade: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-neutral-100">
                      R$ {(Number(item.unit_price) * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-neutral-500">
                      R$ {Number(item.unit_price).toFixed(2)} cada
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo de Valores */}
          <div className="border-t border-gray-200 dark:border-neutral-700 pt-4 space-y-2">
            <div className="flex justify-between text-gray-600 dark:text-neutral-400">
              <span>Subtotal:</span>
              <span>R$ {(Number(order.total_amount || 0) - Number(order.shipping_price || 0) + Number(order.discount_amount || 0)).toFixed(2)}</span>
            </div>
            {Number(order.shipping_price || 0) > 0 && (
              <div className="flex justify-between text-gray-600 dark:text-neutral-400">
                <span>Frete:</span>
                <span>R$ {Number(order.shipping_price || 0).toFixed(2)}</span>
              </div>
            )}
            {Number(order.discount_amount || 0) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto:</span>
                <span>- R$ {Number(order.discount_amount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-neutral-100 pt-2 border-t border-gray-200 dark:border-neutral-700">
              <span>Total:</span>
              <span>R$ {Number(order.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Informações de Pagamento */}
          {order.mp_payment_id && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-neutral-100 mb-2">Pagamento</h3>
              <p className="text-sm text-gray-600 dark:text-neutral-400">ID Mercado Pago: {order.mp_payment_id}</p>
              <p className="text-sm text-gray-600 dark:text-neutral-400">Status: {order.mp_status}</p>
            </div>
          )}

          {/* Informações de Entrega */}
          {(order.shipping_address || order.destination_zip) && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-neutral-100 mb-2">Entrega</h3>
              <p className="text-sm text-gray-600 dark:text-neutral-400">CEP: {order.destination_zip}</p>
              {order.shipping_service_name && (
                <p className="text-sm text-gray-600 dark:text-neutral-400">Serviço: {order.shipping_service_name}</p>
              )}
              {order.shipping_carrier && (
                <p className="text-sm text-gray-600 dark:text-neutral-400">Transportadora: {order.shipping_carrier}</p>
              )}
              {order.tracking_code && (
                <p className="text-sm font-semibold text-blue-600 mt-2">
                  Código de Rastreamento: {order.tracking_code}
                </p>
              )}
            </div>
          )}

          {/* Campo de Rastreamento */}
          {showTrackingInput && (
            <div className="bg-blue-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                Código de Rastreamento
              </label>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-900 text-gray-900 dark:text-neutral-100"
                placeholder="Ex: BR123456789BR"
              />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-neutral-700">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => updateOrderStatus('paid')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >✓ Pago</button>
            <button
              onClick={() => {
                setShowTrackingInput(true);
                setTimeout(() => updateOrderStatus('shipped', true), 100);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >📦 Enviado</button>
            <button
              onClick={() => updateOrderStatus('delivered')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >✓ Entregue</button>
            <button
              onClick={() => updateOrderStatus('pending')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >⏳ Pendente</button>
            <button
              onClick={() => updateOrderStatus('canceled')}
              className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >✕ Cancelar</button>
            <button
              onClick={() => updateOrderStatus('failed')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >✕ Falhou</button>
          </div>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
