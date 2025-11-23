import { Instagram, Heart, MessageCircle, ExternalLink } from 'lucide-react';
import OptimizedImage from './OptimizedImage.jsx';

/**
 * Feed do Instagram
 * Grid de fotos com link para perfil
 */
export default function InstagramFeed() {
  // Imagens placeholder - inspiradas no feed real @base.corporativa
  // TODO: Conectar com Instagram API ou usar imagens reais do feed
  const instagramPosts = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
      likes: 45,
      comments: 3,
      link: 'https://www.instagram.com/base.corporativa/'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=600&fit=crop',
      likes: 52,
      comments: 5,
      link: 'https://www.instagram.com/base.corporativa/'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop',
      likes: 38,
      comments: 2,
      link: 'https://www.instagram.com/base.corporativa/'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop',
      likes: 67,
      comments: 8,
      link: 'https://www.instagram.com/base.corporativa/'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&h=600&fit=crop',
      likes: 41,
      comments: 4,
      link: 'https://www.instagram.com/base.corporativa/'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=600&fit=crop',
      likes: 58,
      comments: 6,
      link: 'https://www.instagram.com/base.corporativa/'
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-white via-neutral-50 to-white dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl mb-6 shadow-xl">
            <Instagram className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Siga @base.corporativa
          </h2>
          
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-8">
            Camisas minimalistas premium | Design atemporal | Tecido de qualidade<br />
            <span className="text-sm text-primary-600 dark:text-primary-400 font-semibold">466 seguidores • 9 posts</span>
          </p>

          <a
            href="https://www.instagram.com/base.corporativa/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <Instagram className="w-5 h-5" />
            Seguir no Instagram
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Grid de Posts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post, index) => (
            <InstagramPost key={post.id} post={post} index={index} />
          ))}
        </div>

        {/* CTA Bottom */}
        <div className="text-center mt-12">
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            📸 Marque <span className="font-bold text-primary-600 dark:text-primary-400">@base.corporativa</span> nas suas fotos e apareça aqui!
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Post individual do Instagram
 */
function InstagramPost({ post, index }) {
  return (
    <a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Imagem */}
      <OptimizedImage
        src={post.image}
        alt="Instagram post"
        width={400}
        height={400}
        className="transition-transform duration-700 group-hover:scale-110"
        objectFit="cover"
      />

      {/* Overlay com Stats */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="flex items-center gap-6 text-white">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 fill-current" />
            <span className="font-bold text-lg">{post.likes}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 fill-current" />
            <span className="font-bold text-lg">{post.comments}</span>
          </div>
        </div>
      </div>

      {/* Instagram Icon Badge */}
      <div className="absolute top-3 right-3 w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
        <Instagram className="w-5 h-5 text-white" />
      </div>
    </a>
  );
}
