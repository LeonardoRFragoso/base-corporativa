/**
 * Google Analytics 4 Event Tracking Utilities
 * Expandido com todos os eventos de ecommerce recomendados
 */

// Get Analytics IDs from environment variables
const GA4_ID = import.meta.env.VITE_GA4_ID || 'G-XXXXXXXXXX';

// Track page views
export const trackPageView = (url) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA4_ID, {
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

// Track view item list (catalog, category)
export const trackViewItemList = (items, listName) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item_list', {
      item_list_name: listName,
      items: items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category?.name,
        price: parseFloat(item.base_price || item.price || 0)
      }))
    });
  }
};

// Track select item (click on product)
export const trackSelectItem = (item, listName = 'Product Catalog') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'select_item', {
      item_list_name: listName,
      items: [{
        item_id: item.id,
        item_name: item.name,
        item_category: item.category?.name,
        price: parseFloat(item.base_price || item.price || 0)
      }]
    });
  }
};

// Track filter usage
export const trackFilterUsed = (filterType, filterValue) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'filter_used', {
      filter_type: filterType,
      filter_value: filterValue
    });
  }
};

// Track newsletter signup
export const trackNewsletterSignup = (email, location = 'footer') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'newsletter_signup', {
      method: location
    });
  }
  
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead');
  }
};

// Track coupon application
export const trackApplyCoupon = (couponCode, discountValue) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'apply_coupon', {
      coupon_code: couponCode,
      discount_value: discountValue
    });
  }
};

// Track shipping calculation
export const trackCalculateShipping = (zipCode, shippingValue) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'calculate_shipping', {
      zip_code: zipCode,
      shipping_value: shippingValue
    });
  }
};

// Track add payment info
export const trackAddPaymentInfo = (paymentMethod) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_payment_info', {
      payment_type: paymentMethod
    });
  }
  
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddPaymentInfo');
  }
};

// Track add shipping info
export const trackAddShippingInfo = (shippingTier) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_shipping_info', {
      shipping_tier: shippingTier
    });
  }
};

// Track contact form submission
export const trackContactForm = (formType = 'contact') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'contact_form_submit', {
      form_type: formType
    });
  }
  
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Contact');
  }
};

// Track product comparison
export const trackCompareProducts = (productIds) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'compare_products', {
      product_count: productIds.length,
      product_ids: productIds.join(',')
    });
  }
};

// Track review submission
export const trackSubmitReview = (productId, rating) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'submit_review', {
      product_id: productId,
      rating: rating
    });
  }
};

// Track social share
export const trackSocialShare = (platform, contentType, contentId) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'share', {
      method: platform,
      content_type: contentType,
      content_id: contentId
    });
  }
};

// Track exit intent popup
export const trackExitIntent = (action = 'shown') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exit_intent', {
      action: action
    });
  }
};

// Custom event tracking
export const trackCustomEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};
