import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { trackExitIntent } from '../utils/analytics';
import { Link } from 'react-router-dom';

export default function ExitIntentPopup({ cartItems = [] }) {
  const [show, setShow] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !hasShown && cartItems.length > 0) {
        setShow(true);
        setHasShown(true);
        trackExitIntent('shown');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown, cartItems]);

  const handleClose = () => {
    setShow(false);
    trackExitIntent('closed');
  };

  const handleContinue = () => {
    setShow(false);
    trackExitIntent('continued_shopping');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-bronze-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🛒</span>
          </div>

          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Espere! Não vá ainda...
          </h2>

          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
            Você tem <strong>{cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}</strong> no carrinho!
          </p>

          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-primary-900 dark:text-primary-300">
              🎁 Use o cupom <span className="text-lg font-mono">VOLTEI10</span> para ganhar 10% de desconto!
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/cart"
              onClick={handleContinue}
              className="block w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-bronze-700 text-white font-bold rounded-xl hover:from-primary-500 hover:to-bronze-600 transition-all text-center"
            >
              Finalizar minha compra
            </Link>
            <button
              onClick={handleClose}
              className="w-full px-6 py-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 font-medium transition-colors"
            >
              Continuar navegando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
