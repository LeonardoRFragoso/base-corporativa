import { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import SEO from '../components/SEO.jsx';
import { OrganizationSchema, WebsiteSchema } from '../components/StructuredData.jsx';

// Novos componentes criados
import PromoBanner from '../components/PromoBanner.jsx';
import HeroProductSlider from '../components/HeroProductSlider.jsx';
import FeaturedCategories from '../components/FeaturedCategories.jsx';
import FeaturedProducts from '../components/FeaturedProducts.jsx';
import ImpactStats from '../components/ImpactStats.jsx';
import Testimonials from '../components/Testimonials.jsx';
import InstagramFeed from '../components/InstagramFeed.jsx';
import NewsletterSection from '../components/NewsletterSection.jsx';

// Componentes existentes mantidos
import { Link } from 'react-router-dom';

/**
 * HOME PAGE MELHORADA
 * Todas as melhorias visuais implementadas
 */
export default function HomeNew() {
  const [heroProducts, setHeroProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const catalogPdfUrl = import.meta.env.VITE_CATALOG_PDF_URL || `${baseURL}/media/catalog/catalogo.pdf`;

  // Carregar produtos da API
  useEffect(() => {
    async function loadProducts() {
      try {
        // 4 produtos para o hero slider
        const heroRes = await api.get('/api/products/?is_featured=true&limit=4');
        const heroData = heroRes.data.results || heroRes.data;
        setHeroProducts(Array.isArray(heroData) ? heroData : []);

        // 8 produtos em destaque para o grid
        const featuredRes = await api.get('/api/products/?ordering=-created_at&limit=8');
        const featuredData = featuredRes.data.results || featuredRes.data;
        setFeaturedProducts(Array.isArray(featuredData) ? featuredData : []);
      } catch (e) {
        console.error('Erro ao carregar produtos:', e);
        // Fallback: usar arrays vazios
        setHeroProducts([]);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  async function handleDownloadCatalog() {
    try {
      const res = await fetch(catalogPdfUrl);
      if (!res.ok) throw new Error('Arquivo não encontrado');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'catalogo-base-corporativa.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      window.open(catalogPdfUrl, '_blank');
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600 dark:text-neutral-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* SEO */}
      <SEO 
        title="BASE CORPORATIVA - Roupas Corporativas de Qualidade Premium"
        description="Roupas corporativas minimalistas e de alta qualidade. Conforto e praticidade para o profissional moderno. Frete grátis acima de R$ 200. Mais de 1.000 profissionais já escolheram a BASE CORPORATIVA."
        keywords="roupas corporativas, uniformes profissionais, camisas polo masculinas, calças sociais, roupas de trabalho, moda corporativa, uniformes empresariais, roupas minimalistas"
        url="/"
      />
      <OrganizationSchema />
      <WebsiteSchema />

      {/* ========== NOVO: Banner Promocional com Countdown ========== */}
      <PromoBanner />

      {/* ========== MELHORADO: Hero com Slider de Produtos Reais ========== */}
      {heroProducts.length > 0 ? (
        <HeroProductSlider products={heroProducts} />
      ) : (
        // Fallback: Hero original se não houver produtos
        <HeroFallback />
      )}

      {/* ========== NOVO: Categorias em Destaque ========== */}
      <FeaturedCategories />

      {/* ========== NOVO: Produtos em Destaque (Grid) ========== */}
      {featuredProducts.length > 0 && (
        <FeaturedProducts 
          products={featuredProducts}
          title="Destaques da Coleção"
        />
      )}

      {/* ========== MANTIDO: Features Section (3 cards de benefícios) ========== */}
      <FeaturesSection />

      {/* ========== NOVO: Estatísticas com Counter Animado ========== */}
      <ImpactStats />

      {/* ========== NOVO: Depoimentos com Fotos ========== */}
      <Testimonials />

      {/* ========== MANTIDO: Social Proof Section (4 cards de garantias) ========== */}
      <SocialProofSection />

      {/* ========== NOVO: Instagram Feed ========== */}
      <InstagramFeed />

      {/* ========== NOVO: Newsletter Otimizada ========== */}
      <NewsletterSection />

      {/* ========== MANTIDO: CTA Final ========== */}
      <CTASection handleDownloadCatalog={handleDownloadCatalog} />
    </div>
  );
}

/**
 * Hero Fallback (caso não haja produtos)
 */
function HeroFallback() {
  return (
    <section className="relative bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/5 via-transparent to-bronze-900/5"></div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-5xl lg:text-7xl font-display font-black mb-6">
            BASE CORPORATIVA
          </h1>
          <p className="text-xl text-primary-200 mb-8">
            Conforto e praticidade diária
          </p>
          <Link 
            to="/catalog"
            className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-bronze-600 to-bronze-700 text-white font-bold text-lg rounded-xl hover:from-bronze-500 hover:to-bronze-600 transition-all"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Features Section (3 cards de benefícios - MANTIDO)
 */
function FeaturesSection() {
  return (
    <section className="py-20 bg-white dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Por que escolher a BASE CORPORATIVA?
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            Desenvolvemos cada peça pensando no profissional moderno que valoriza qualidade, conforto e praticidade.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="✓"
            number="01"
            title="Tecidos de qualidade"
            description="Materiais duráveis e confortáveis, selecionados especialmente para resistir ao uso diário mantendo a elegância."
            color="primary"
          />
          <FeatureCard
            icon="▣"
            number="02"
            title="Design minimalista"
            description="Peças atemporais com design clean e sofisticado, que combinam perfeitamente entre si criando looks versáteis."
            color="bronze"
          />
          <FeatureCard
            icon="$"
            number="03"
            title="Preço justo"
            description="Qualidade premium a preços acessíveis. Acreditamos que roupas de trabalho de qualidade devem estar ao alcance de todos."
            color="primary"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, number, title, description, color }) {
  const colorClasses = color === 'primary' 
    ? 'from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600' 
    : 'from-bronze-700 to-bronze-800 dark:from-bronze-600 dark:to-bronze-700';

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-neutral-100 dark:border-neutral-700">
      <div className="absolute top-6 right-6 text-5xl font-bold text-neutral-100 dark:text-neutral-800">{number}</div>
      <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses} rounded-xl flex items-center justify-center mb-6 text-2xl`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">{title}</h3>
      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{description}</p>
    </div>
  );
}

/**
 * Social Proof Section (4 cards de garantias - MANTIDO)
 */
function SocialProofSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-50/30 via-white to-bronze-50/20 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          <ProofCard icon="📦" title="Frete Grátis" description="Acima de R$ 200" />
          <ProofCard icon="✓" title="Garantia" description="30 dias para troca" />
          <ProofCard icon="🔒" title="Segurança" description="Compra protegida" />
          <ProofCard icon="💬" title="Suporte" description="Atendimento especializado" />
        </div>
      </div>
    </section>
  );
}

function ProofCard({ icon, title, description }) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg text-center hover:shadow-2xl transition-all">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">{title}</h3>
      <p className="text-neutral-600 dark:text-neutral-300">{description}</p>
    </div>
  );
}

/**
 * CTA Section (MANTIDO)
 */
function CTASection({ handleDownloadCatalog }) {
  return (
    <section className="py-28 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-5xl font-display font-bold mb-8 bg-gradient-to-r from-white via-primary-100 to-bronze-200 bg-clip-text text-transparent">
          Pronto para renovar seu guarda-roupa profissional?
        </h2>
        <p className="text-xl text-neutral-200 mb-14 max-w-4xl mx-auto">
          Descubra nossa coleção completa de roupas corporativas e encontre as peças perfeitas para elevar seu estilo profissional.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link 
            to="/catalog"
            className="inline-flex items-center justify-center px-12 py-6 bg-gradient-to-r from-primary-600 to-bronze-700 hover:from-primary-500 hover:to-bronze-600 text-white font-bold text-lg rounded-xl shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            Explorar catálogo
            <svg className="ml-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          <button 
            onClick={handleDownloadCatalog}
            className="inline-flex items-center justify-center px-12 py-6 border-2 border-neutral-600 hover:border-primary-500 text-neutral-200 hover:text-white hover:bg-neutral-800/50 font-bold text-lg rounded-xl transition-all duration-300"
          >
            <svg className="mr-3 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Baixar catálogo PDF
          </button>
        </div>
      </div>
    </section>
  );
}
