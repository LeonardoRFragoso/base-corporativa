export function exportToCSV(data, filename) {
  if (!data || data.length === 0) {
    throw new Error('Nenhum dado para exportar')
  }

  // Get headers from first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value ?? ''
      }).join(',')
    )
  ].join('\n')

  // Create blob and download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToJSON(data, filename) {
  if (!data) {
    throw new Error('Nenhum dado para exportar')
  }

  const jsonContent = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.json`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToPDF(data, filename, title) {
  // For PDF export, you would typically use a library like jsPDF
  // This is a placeholder implementation
  console.log('PDF export would happen here', { data, filename, title })
  throw new Error('Exportação PDF não implementada ainda. Use CSV ou JSON.')
}

export function prepareOrdersForExport(orders) {
  return orders.map(order => ({
    'ID': order.id,
    'Cliente': order.user_email || order.guest_email,
    'Total': `R$ ${Number(order.total).toFixed(2)}`,
    'Status': order.status,
    'Método de Pagamento': order.payment_method,
    'Data': new Date(order.created_at).toLocaleString('pt-BR'),
    'Itens': order.items?.length || 0
  }))
}

export function prepareProductsForExport(products) {
  return products.map(product => ({
    'ID': product.id,
    'Nome': product.name,
    'Categoria': product.category?.name || 'N/A',
    'Preço': `R$ ${Number(product.base_price || product.price).toFixed(2)}`,
    'Estoque Total': product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0,
    'Variantes': product.variants?.length || 0,
    'Ativo': product.is_active ? 'Sim' : 'Não',
    'Data de Criação': new Date(product.created_at).toLocaleString('pt-BR')
  }))
}

export function prepareCustomersForExport(customers) {
  return customers.map(customer => ({
    'ID': customer.id,
    'Nome': customer.username || customer.email,
    'Email': customer.email,
    'CPF': customer.cpf || 'N/A',
    'Telefone': customer.phone || 'N/A',
    'Data de Cadastro': new Date(customer.date_joined).toLocaleString('pt-BR'),
    'Último Login': customer.last_login ? new Date(customer.last_login).toLocaleString('pt-BR') : 'Nunca',
    'Ativo': customer.is_active ? 'Sim' : 'Não'
  }))
}
