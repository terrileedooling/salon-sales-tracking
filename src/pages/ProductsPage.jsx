import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import ProductModal from '../components/Products/ProductModal';
import ProductList from '../components/Products/ProductList';
// import CategoryModal from '../components/CategoryModal';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { Plus, Filter, Download, Upload } from 'lucide-react';
import './ProductsPage.css';
import { Package } from 'lucide-react';

const ProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    supplier: '',
    lowStock: false
  });

  useEffect(() => {
    fetchProducts();
  }, [user, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) return;

      const queryFilters = {};
      if (filters.category) queryFilters.category = filters.category;
      if (filters.supplier) queryFilters.supplierId = filters.supplier;
      
      const productsData = await firestoreService.getCollection('products', user.uid, queryFilters);
      
      // Apply low stock filter
      let filteredProducts = productsData;
      if (filters.lowStock) {
        filteredProducts = productsData.filter(product => product.stock <= 10);
      }
      
      setProducts(filteredProducts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await firestoreService.deleteDocument('products', productId);
        fetchProducts();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'SKU', 'Category', 'Price', 'Cost', 'Stock', 'Supplier'];
    const rows = products.map(p => [
      p.name,
      p.sku || '-',
      p.category || '-',
      p.price || 0,
      p.cost || 0,
      p.stock || 0,
      p.supplierName || '-'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products.csv';
    link.click();
  };

  if (loading) {
    return (
      <div className="products-loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <div>
          <h1>Products</h1>
          <p className="page-subtitle">Manage your product inventory and pricing</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowCategoryModal(true)}
          >
            Categories
          </button>
          <button 
            className="btn btn-secondary"
            onClick={exportToCSV}
          >
            <Download size={16} />
            Export
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingProduct(null);
              setShowProductModal(true);
            }}
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchProducts} />}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option value="">All Categories</option>
            <option value="haircare">Haircare</option>
            <option value="skincare">Skincare</option>
            <option value="makeup">Makeup</option>
            <option value="tools">Tools</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.lowStock}
              onChange={(e) => setFilters({...filters, lowStock: e.target.checked})}
            />
            Show Low Stock Only
          </label>
        </div>
        
        <button 
          className="btn btn-secondary"
          onClick={() => setFilters({ category: '', supplier: '', lowStock: false })}
        >
          Clear Filters
        </button>
      </div>

      {/* Summary Stats */}
      <div className="products-summary">
        <div className="summary-card">
          <h3>Total Products</h3>
          <p className="summary-value">{products.length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Value</h3>
          <p className="summary-value">
            R{products.reduce((sum, p) => sum + (p.price * p.stock || 0), 0).toLocaleString('en-ZA')}
          </p>
        </div>
        <div className="summary-card">
          <h3>Low Stock Items</h3>
          <p className="summary-value danger">
            {products.filter(p => p.stock <= 10).length}
          </p>
        </div>
        <div className="summary-card">
          <h3>Categories</h3>
          <p className="summary-value">
            {[...new Set(products.map(p => p.category))].filter(Boolean).length}
          </p>
        </div>
      </div>

      {/* Products List */}
      <div className="products-list-section">
        {products.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>No products found</h3>
            <p>Add your first product to get started</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setEditingProduct(null);
                setShowProductModal(true);
              }}
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>
        ) : (
          <ProductList 
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Modals */}
      {showProductModal && (
        <ProductModal
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          onSave={fetchProducts}
          product={editingProduct}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </div>
  );
};

export default ProductsPage;