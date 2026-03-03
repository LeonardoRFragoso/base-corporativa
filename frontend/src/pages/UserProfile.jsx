import { useState } from 'react';
import { useProfile, useChangePassword, useUserStats } from '../hooks/useProfile';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui';
import Button from '../components/ui/Button';
import Tabs from '../components/ui/Tabs';
import Skeleton from '../components/ui/Skeleton';
import { User, Lock, BarChart3, Mail, Phone, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Página de Perfil do Usuário
 */
export default function UserProfile() {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const { changePassword, loading: changingPassword } = useChangePassword();
  const { stats, loading: loadingStats } = useUserStats();

  // Estado do formulário de perfil
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    cpf: '',
    birth_date: ''
  });

  // Estado do formulário de senha
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Atualizar dados quando o perfil carregar
  useState(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        cpf: profile.cpf || '',
        birth_date: profile.birth_date || ''
      });
    }
  }, [profile]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile(profileData);
    if (result.success) {
      // Dados atualizados
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('As senhas não coincidem');
      return;
    }

    const result = await changePassword(
      passwordData.old_password,
      passwordData.new_password,
      passwordData.confirm_password
    );

    if (result.success) {
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12">
        <div className="container-responsive">
          <Skeleton variant="title" className="mb-8" />
          <Skeleton variant="card" />
        </div>
      </div>
    );
  }

  const tabs = [
    {
      label: 'Dados Pessoais',
      icon: <User size={18} />,
      content: (
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Nome"
              value={profileData.first_name}
              onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
              leftIcon={<User size={20} />}
              required
            />
            <Input
              label="Sobrenome"
              value={profileData.last_name}
              onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            leftIcon={<Mail size={20} />}
            required
          />

          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Telefone"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              leftIcon={<Phone size={20} />}
            />
            <Input
              label="Data de Nascimento"
              type="date"
              value={profileData.birth_date}
              onChange={(e) => setProfileData({ ...profileData, birth_date: e.target.value })}
              leftIcon={<Calendar size={20} />}
            />
          </div>

          <Input
            label="CPF"
            value={profileData.cpf}
            onChange={(e) => setProfileData({ ...profileData, cpf: e.target.value })}
          />

          <Button type="submit" variant="primary" size="lg" loading={loading}>
            Salvar Alterações
          </Button>
        </form>
      )
    },
    {
      label: 'Segurança',
      icon: <Lock size={18} />,
      content: (
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <Input
            label="Senha Atual"
            type="password"
            value={passwordData.old_password}
            onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
            leftIcon={<Lock size={20} />}
            required
          />

          <Input
            label="Nova Senha"
            type="password"
            value={passwordData.new_password}
            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
            leftIcon={<Lock size={20} />}
            helperText="Mínimo de 8 caracteres"
            required
          />

          <Input
            label="Confirmar Nova Senha"
            type="password"
            value={passwordData.confirm_password}
            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
            leftIcon={<Lock size={20} />}
            required
          />

          <Button type="submit" variant="primary" size="lg" loading={changingPassword}>
            Alterar Senha
          </Button>
        </form>
      )
    },
    {
      label: 'Estatísticas',
      icon: <BarChart3 size={18} />,
      content: loadingStats ? (
        <Skeleton count={4} />
      ) : stats ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {stats.total_orders}
              </div>
              <div className="text-neutral-600 dark:text-neutral-400">
                Pedidos Realizados
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                R$ {stats.total_spent?.toFixed(2) || '0.00'}
              </div>
              <div className="text-neutral-600 dark:text-neutral-400">
                Total Gasto
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stats.total_reviews}
              </div>
              <div className="text-neutral-600 dark:text-neutral-400">
                Avaliações Feitas
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {stats.wishlist_items}
              </div>
              <div className="text-neutral-600 dark:text-neutral-400">
                Itens na Wishlist
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-4">
            <CardContent className="p-6">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Membro desde
              </div>
              <div className="text-2xl font-bold">
                {new Date(stats.member_since).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12">
      <div className="container-responsive">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Meu Perfil</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs tabs={tabs} variant="line" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
