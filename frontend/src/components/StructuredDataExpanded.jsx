import { Helmet } from 'react-helmet-async';

export function ProductSchemaExpanded({ product, reviews = [] }) {
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const siteURL = 'https://basecorporativa.store';

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images?.map(img => 
      img.image.startsWith('http') ? img.image : `${baseURL}${img.image}`
    ) || [],
    "description": product.description,
    "sku": product.sku || `PROD-${product.id}`,
    "brand": {
      "@type": "Brand",
      "name": "BASE CORPORATIVA"
    },
    "offers": {
      "@type": "Offer",
      "url": `${siteURL}/product/${product.id}`,
      "priceCurrency": "BRL",
      "price": product.base_price,
      "availability": product.variants?.some(v => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "priceValidUntil": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "seller": {
        "@type": "Organization",
        "name": "BASE CORPORATIVA"
      }
    }
  };

  if (reviews.length > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": avgRating.toFixed(1),
      "reviewCount": reviews.length,
      "bestRating": "5",
      "worstRating": "1"
    };

    schema.review = reviews.slice(0, 5).map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": review.user_name || "Cliente"
      },
      "reviewBody": review.comment,
      "datePublished": review.created_at
    }));
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export function BreadcrumbSchemaExpanded({ items }) {
  const siteURL = 'https://basecorporativa.store';

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${siteURL}${item.url}`
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export function FAQSchema({ faqs }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

export function OfferSchema({ product, coupon = null }) {
  const siteURL = 'https://basecorporativa.store';
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  const price = coupon 
    ? (product.base_price * (1 - (coupon.percent_off || 0) / 100)).toFixed(2)
    : product.base_price;

  const schema = {
    "@context": "https://schema.org/",
    "@type": "Offer",
    "url": `${siteURL}/product/${product.id}`,
    "priceCurrency": "BRL",
    "price": price,
    "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    "availability": product.variants?.some(v => v.stock > 0)
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": {
      "@type": "Organization",
      "name": "BASE CORPORATIVA"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
