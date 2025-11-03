import { api } from '../lib/api';
import toast from 'react-hot-toast';

/**
 * Função auxiliar para download de arquivos CSV
 */
export const downloadCSV = async (url, filename, params = {}) => {
  try {
    const response = await api.get(url, {
      params,
      responseType: 'blob',
    });

    // Criar URL do blob
    const blob = new Blob([response.data], { type: 'text/csv; charset=utf-8' });
    const downloadUrl = window.URL.createObjectURL(blob);
    
    // Criar link temporário e clicar
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'export.csv';
    document.body.appendChild(link);
    link.click();
    
    // Limpar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    
    toast.success('Arquivo exportado com sucesso!');
  } catch (error) {
    console.error('Erro ao exportar:', error);
    toast.error('Erro ao exportar arquivo');
  }
};

/**
 * Exportar pedidos
 */
export const exportOrders = (filters = {}) => {
  return downloadCSV('/api/analytics/export/orders/', 'pedidos.csv', filters);
};

/**
 * Exportar produtos
 */
export const exportProducts = () => {
  return downloadCSV('/api/analytics/export/products/', 'produtos.csv');
};

/**
 * Exportar clientes
 */
export const exportCustomers = () => {
  return downloadCSV('/api/analytics/export/customers/', 'clientes.csv');
};

/**
 * Exportar relatório de vendas
 */
export const exportSalesReport = (days = 30) => {
  return downloadCSV('/api/analytics/export/sales/', 'relatorio_vendas.csv', { days });
};

/**
 * Exportar produtos com estoque baixo
 */
export const exportLowStock = (threshold = 5) => {
  return downloadCSV('/api/analytics/export/low-stock/', 'estoque_baixo.csv', { threshold });
};

/**
 * Exportar dados genéricos em JSON para CSV
 */
export const exportDataToCSV = (data, filename, headers) => {
  if (!data || data.length === 0) {
    toast.error('Nenhum dado para exportar');
    return;
  }

  try {
    // Criar CSV
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escapar vírgulas e aspas
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(',')
      )
    ].join('\n');

    // BOM para UTF-8
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv; charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Arquivo exportado com sucesso!');
  } catch (error) {
    console.error('Erro ao exportar:', error);
    toast.error('Erro ao exportar arquivo');
  }
};
