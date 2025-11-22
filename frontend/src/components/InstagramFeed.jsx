import { Instagram, Heart, MessageCircle, ExternalLink } from 'lucide-react';
import OptimizedImage from './OptimizedImage.jsx';

/**
 * Feed do Instagram
 * Grid de fotos com link para perfil
 */
export default function InstagramFeed() {
  // Placeholder - substituir por API real do Instagram ou imagens estáticas
  const instagramPosts = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&h=600&fit=crop',
      likes: 243,
      comments: 18,
      link: 'https://instagram.com/basecorporativa'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660?w=600&h=600&fit=crop',
      likes: 312,
      comments: 24,
      link: 'https://instagram.com/basecorporativa'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=600&fit=crop',
      likes: 189,
      comments: 12,
      link: 'https://instagram.com/basecorporativa'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=600&h=600&fit=crop',
      likes: 278,
      comments: 21,
      link: 'https://instagram.com/basecorporativa'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
      likes: 156,
      comments: 9,
      link: 'https://instagram.com/basecorporativa'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop',
      likes: 421,
      comments: 35,
      link: 'https://instagram.com/basecorporativa'
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
            Siga @basecorporativa
          </h2>
          
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mb-8">
            Inspiração diária, lançamentos e bastidores. Faça parte da nossa comunidade!
          </p>

          <a
            href="https://instagram.com/basecorporativa"
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
            📸 Marque <span className="font-bold text-primary-600 dark:text-primary-400">@basecorporativa</span> nas suas fotos e apareça aqui!
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
