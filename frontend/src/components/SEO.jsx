import { Helmet } from 'react-helmet-async'

export default function SEO({
  title = 'BASE CORPORATIVA - Roupas Corporativas de Qualidade',
  description = 'Roupas corporativas minimalistas e de alta qualidade. Conforto e praticidade para o profissional moderno. Frete grátis acima de R$ 200.',
  keywords = 'roupas corporativas, uniformes profissionais, camisas polo, calças sociais, roupas de trabalho, moda corporativa',
  image = '/logo-base-corporativa.png',
  url = '',
  type = 'website',
  noindex = false,
  canonical = null
}) {
  const baseUrl = 'https://basecorporativa.store'
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical || fullUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="BASE CORPORATIVA" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* WhatsApp/Telegram */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="BASE CORPORATIVA - Roupas Corporativas" />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="BASE CORPORATIVA" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="pt-br" />
      <meta name="geo.region" content="BR" />
      <meta name="geo.country" content="Brasil" />
      
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    </Helmet>
  )
}
