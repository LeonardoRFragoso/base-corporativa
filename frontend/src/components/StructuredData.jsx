import { Helmet } from 'react-helmet-async'

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BASE CORPORATIVA",
    "description": "Roupas corporativas minimalistas e de alta qualidade dedicadas ao trabalho profissional",
    "url": "https://basecorporativa.com.br",
    "logo": "https://basecorporativa.com.br/logo-base-corporativa.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Portuguese"
    },
    "sameAs": [
      "https://instagram.com/basecorporativa",
      "https://facebook.com/basecorporativa"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BR",
      "addressLocality": "Brasil"
    }
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  )
}

export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BASE CORPORATIVA",
    "url": "https://basecorporativa.com.br",
    "description": "Loja online de roupas corporativas de qualidade premium",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://basecorporativa.com.br/catalog?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  )
}

export function ProductSchema({ product }) {
  if (!product) return null

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images?.map(img => img.image) || [],
    "brand": {
      "@type": "Brand",
      "name": "BASE CORPORATIVA"
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "BASE CORPORATIVA"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "BRL",
      "lowPrice": Math.min(...(product.variants?.map(v => Number(v.price)) || [Number(product.price)])),
      "highPrice": Math.max(...(product.variants?.map(v => Number(v.price)) || [Number(product.price)])),
      "offerCount": product.variants?.length || 1,
      "availability": product.variants?.some(v => v.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "BASE CORPORATIVA"
      }
    },
    "category": product.category?.name,
    "sku": product.id.toString(),
    "aggregateRating": product.average_rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.average_rating,
      "reviewCount": product.review_count || 0,
      "bestRating": 5,
      "worstRating": 1
    } : undefined
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  )
}

export function BreadcrumbSchema({ items }) {
  if (!items || items.length === 0) return null

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://basecorporativa.com.br${item.url}`
    }))
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  )
}
