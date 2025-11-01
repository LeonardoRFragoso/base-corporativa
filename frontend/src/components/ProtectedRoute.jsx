import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, initialized } = useAuth();

  // Aguardar inicialização do AuthContext
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-neutral-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Verificar autenticação
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar se requer admin
  if (requireAdmin && !user?.is_staff) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
