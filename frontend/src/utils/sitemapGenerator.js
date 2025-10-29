// Utility para gerar sitemap dinâmico com produtos
export function generateSitemap(products = []) {
  const baseUrl = 'https://basecorporativa.com.br'
  const currentDate = new Date().toISOString().split('T')[0]
  
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/catalog', priority: '0.9', changefreq: 'daily' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.6', changefreq: 'monthly' },
    { url: '/size-guide', priority: '0.5', changefreq: 'monthly' },
    { url: '/shipping', priority: '0.5', changefreq: 'monthly' },
    { url: '/returns', priority: '0.5', changefreq: 'monthly' },
    { url: '/faq', priority: '0.5', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.3', changefreq: 'yearly' }
  ]

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`

  // Adicionar páginas estáticas
  staticPages.forEach(page => {
    sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
  })

  // Adicionar produtos dinamicamente
  products.forEach(product => {
    sitemap += `  <url>
    <loc>${baseUrl}/product/${product.id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
  })

  sitemap += `</urlset>`
  
  return sitemap
}

// Função para baixar sitemap como arquivo
export function downloadSitemap(products = []) {
  const sitemapContent = generateSitemap(products)
  const blob = new Blob([sitemapContent], { type: 'application/xml' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sitemap.xml'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}
