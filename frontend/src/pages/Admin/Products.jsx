import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, Package, AlertTriangle, CheckCircle, Edit, Trash2, Plus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const [productsRes, variantsRes] = await Promise.all([
        axios.get(`${API_URL}/api/products/`),
        axios.get(`${API_URL}/api/products/variants/`)
      ]);

      setProducts(productsRes.data);
      setVariants(variantsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setLoading(false);
    }
  };

  const getProductStock = (productId) => {
    const productVariants = variants.filter(v => v.product === productId);
    return productVariants.reduce((sum, v) => sum + v.stock, 0);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) {
      return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', label: 'Sem Estoque' };
    } else if (stock < 10) {
      return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Estoque Baixo' };
    }
    return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Em Estoque' };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const stock = getProductStock(product.id);
    const matchesStock = 
      stockFilter === 'all' ||
      (stockFilter === 'out' && stock === 0) ||
      (stockFilter === 'low' && stock > 0 && stock < 10) ||
      (stockFilter === 'ok' && stock >= 10);
    
    return matchesSearch && matchesStock;
  });

  const ProductModal = ({ product, onClose }) => {
    if (!product) return null;

    const productVariants = variants.filter(v => v.product === product.id);
    const totalStock = productVariants.reduce((sum, v) => sum + v.stock, 0);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Informações</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Categoria:</span> {product.category_name}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Preço Base:</span> R$ {Number(product.base_price).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={product.is_active ? 'text-green-600' : 'text-red-600'}>
                    {product.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Estoque</h3>
                <p className="text-3xl font-bold text-blue-600">{totalStock}</p>
                <p className="text-sm text-gray-600">unidades totais</p>
                <p className="text-sm text-gray-600 mt-2">
                  {productVariants.length} variante(s)
                </p>
              </div>
            </div>

            {/* Descrição */}
            {product.description && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
                <p className="text-sm text-gray-700">{product.description}</p>
              </div>
            )}

            {/* Variantes */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Variantes</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tamanho</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cor</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estoque</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {productVariants.map((variant) => {
                      const status = getStockStatus(variant.stock);
                      return (
                        <tr key={variant.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{variant.sku}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{variant.size || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{variant.color || '-'}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            R$ {Number(variant.price || product.base_price).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                              <status.icon className="w-3 h-3 mr-1" />
                              {variant.stock}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Imagens */}
            {product.images && product.images.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Imagens</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={image.image}
                        alt={image.alt_text || product.name}
                        className="w-full h-full object-cover"
                      />
                      {image.is_primary && (
                        <span className="absolute top-2 right-2 bg-amber-600 text-white text-xs px-2 py-1 rounded">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-between">
            <button
              onClick={() => window.open(`${API_URL}/admin/catalog/product/${product.id}/change/`, '_blank')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar no Admin
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciar Produtos</h1>
              <p className="text-gray-600 mt-2">Total de {filteredProducts.length} produtos</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.open(`${API_URL}/admin/catalog/product/add/`, '_blank')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Novo Produto
              </button>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-500 text-sm">Total de Produtos</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-4">
            <p className="text-green-700 text-sm">Em Estoque</p>
            <p className="text-2xl font-bold text-green-600">
              {products.filter(p => getProductStock(p.id) >= 10).length}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg shadow-md p-4">
            <p className="text-orange-700 text-sm">Estoque Baixo</p>
            <p className="text-2xl font-bold text-orange-600">
              {products.filter(p => {
                const stock = getProductStock(p.id);
                return stock > 0 && stock < 10;
              }).length}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg shadow-md p-4">
            <p className="text-red-700 text-sm">Sem Estoque</p>
            <p className="text-2xl font-bold text-red-600">
              {products.filter(p => getProductStock(p.id) === 0).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome ou slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none"
              >
                <option value="all">Todos os Estoques</option>
                <option value="ok">Em Estoque (≥10)</option>
                <option value="low">Estoque Baixo (&lt;10)</option>
                <option value="out">Sem Estoque</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const stock = getProductStock(product.id);
            const status = getStockStatus(stock);
            const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];

            return (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="relative aspect-square bg-gray-100">
                  {primaryImage ? (
                    <img
                      src={primaryImage.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  {!product.is_active && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                        INATIVO
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{product.category_name}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      R$ {Number(product.base_price).toFixed(2)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                      <status.icon className="w-3 h-3 mr-1" />
                      {stock}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg transition-colors font-medium"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
};

export default Products;
