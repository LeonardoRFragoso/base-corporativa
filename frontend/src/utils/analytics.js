/**
 * Google Analytics 4 Event Tracking Utilities
 */

// Track page views
export const trackPageView = (url) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-XXXXXXXXXX', {
      page_path: url,
    });
  }
};

// Track e-commerce events
export const trackAddToCart = (product) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'BRL',
      value: parseFloat(product.price) * product.qty,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_variant: `${product.size}-${product.color}`,
        price: parseFloat(product.price),
        quantity: product.qty
      }]
    });
  }
  
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: parseFloat(product.price) * product.qty,
      currency: 'BRL'
    });
  }
};

export const trackRemoveFromCart = (product) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'remove_from_cart', {
      currency: 'BRL',
      value: parseFloat(product.price) * product.qty,
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: parseFloat(product.price),
        quantity: product.qty
      }]
    });
  }
};

export const trackViewItem = (product) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'BRL',
      value: parseFloat(product.base_price),
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category?.name,
        price: parseFloat(product.base_price)
      }]
    });
  }
  
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: parseFloat(product.base_price),
      currency: 'BRL'
    });
  }
};

export const trackBeginCheckout = (items, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'BRL',
      value: value,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: parseFloat(item.price),
        quantity: item.qty
      }))
    });
  }
  
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: items.map(i => i.id),
      contents: items.map(i => ({
        id: i.id,
        quantity: i.qty
      })),
      value: value,
      currency: 'BRL'
    });
  }
};

export const trackPurchase = (orderId, value, items) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: orderId,
      value: value,
      currency: 'BRL',
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: parseFloat(item.price),
        quantity: item.qty
      }))
    });
  }
  
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: value,
      currency: 'BRL',
      content_ids: items.map(i => i.id),
      contents: items.map(i => ({
        id: i.id,
        quantity: i.qty
      }))
    });
  }
};

export const trackSearch = (searchTerm) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm
    });
  }
  
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Search', {
      search_string: searchTerm
    });
  }
};

export const trackSignUp = (method = 'email') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', {
      method: method
    });
  }
  
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'CompleteRegistration');
  }
};

export const trackLogin = (method = 'email') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'login', {
      method: method
    });
  }
};

export const trackAddToWishlist = (product) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_wishlist', {
      currency: 'BRL',
      value: parseFloat(product.base_price),
      items: [{
        item_id: product.id,
        item_name: product.name
      }]
    });
  }
  
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToWishlist', {
      content_ids: [product.id],
      content_name: product.name,
      value: parseFloat(product.base_price),
      currency: 'BRL'
    });
  }
};

// Custom event tracking
export const trackCustomEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};
