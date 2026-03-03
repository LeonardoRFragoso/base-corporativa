import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

/**
 * Hook para gerenciamento de perfil do usuário
 */
export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/user/profile/');
      setProfile(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfile = async (data) => {
    try {
      const response = await api.patch('/api/user/profile/', data);
      setProfile(response.data);
      toast.success('Perfil atualizado com sucesso!');
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao atualizar perfil';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
}

/**
 * Hook para trocar senha
 */
export function useChangePassword() {
  const [loading, setLoading] = useState(false);

  const changePassword = async (oldPassword, newPassword, confirmPassword) => {
    try {
      setLoading(true);
      await api.post('/api/user/profile/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      toast.success('Senha alterada com sucesso!');
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao alterar senha';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading };
}

/**
 * Hook para deletar conta
 */
export function useDeleteAccount() {
  const [loading, setLoading] = useState(false);

  const deleteAccount = async (password) => {
    try {
      setLoading(true);
      await api.delete('/api/user/profile/delete/', {
        data: { password }
      });
      toast.success('Conta deletada com sucesso');
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao deletar conta';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return { deleteAccount, loading };
}

/**
 * Hook para estatísticas do usuário
 */
export function useUserStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const response = await api.get('/api/user/profile/stats/');
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao carregar estatísticas:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
}
