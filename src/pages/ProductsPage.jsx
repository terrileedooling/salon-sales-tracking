import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../firebase/firestoreService';
import ProductModal from '../components/Products/ProductModal';
import ProductList from '../components/Products/ProductList';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { Plus, Filter, Download, Upload } from 'lucide-react';
import '../styles/ProductsPage.css';
import { Package } from 'lucide-react';

const ProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
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
    if (user) {
      fetchDashboardData();
    }
  }, [user, filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) return;

      const categoriesData = await firestoreService.getCollection('categories', user.uid);
      setCategories(categoriesData);

      const allProductsData = await firestoreService.getCollection('products', user.uid);
      
      // Calculate product counts per category
      const counts = {};
      allProductsData.forEach(product => {
        if (product.category) {
          counts[product.category] = (counts[product.category] || 0) + 1;
        }
      });
      setCategoryCounts(counts);
      
      // Apply filters for display
      let filteredProducts = allProductsData;
      
      // Apply category filter
      if (filters.category) {
        filteredProducts = filteredProducts.filter(product => 
          product.category === filters.category
        );
      }
      
      // Apply supplier filter
      if (filters.supplier) {
        filteredProducts = filteredProducts.filter(product => 
          product.supplierId === filters.supplier
        );
      }
      
      // Apply low stock filter
      if (filters.lowStock) {
        filteredProducts = filteredProducts.filter(product => 
          product.stock <= (product.minStock || 10)
        );
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
        fetchDashboardData();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleAddCategory = async () => {
    const newCategory = prompt('Enter new category name:');
    if (newCategory && newCategory.trim()) {
      try {
        await firestoreService.addDocument('categories', {
          name: newCategory.trim(),
          userId: user.uid,
          description: '',
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString()
        });
        
        fetchDashboardData();
        alert(`Category "${newCategory}" added successfully!`);
      } catch (err) {
        alert('Error adding category: ' + err.message);
      }
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    if (window.confirm(`Are you sure you want to delete category "${categoryName}"? This will not delete products, but will remove their category assignment.`)) {
      try {
        const categoriesData = await firestoreService.getCollection('categories', user.uid);
        const categoryToDelete = categoriesData.find(cat => cat.name === categoryName);
        
        if (categoryToDelete) {
          await firestoreService.deleteDocument('categories', categoryToDelete.id);
          
          const productsData = await firestoreService.getCollection('products', user.uid);
          const updatePromises = productsData
            .filter(product => product.category === categoryName)
            .map(product => 
              firestoreService.updateDocument('products', product.id, {
                ...product,
                category: ''
              })
            );
          
          await Promise.all(updatePromises);
          fetchDashboardData();
          
          if (filters.category === categoryName) {
            setFilters({...filters, category: ''});
          }
          
          alert(`Category "${categoryName}" deleted successfully!`);
        }
      } catch (err) {
        alert('Error deleting category: ' + err.message);
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
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p className="page-subtitle">Manage your product inventory and pricing</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowCategoryModal(true)}
          >
            Manage Categories ({categories.length})
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

      {error && <ErrorMessage message={error} onRetry={fetchDashboardData} />}

      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option value="">All Categories ({Object.values(categoryCounts).reduce((a, b) => a + b, 0)})</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name} ({categoryCounts[category.name] || 0})
              </option>
            ))}
            {categories.length === 0 && (
              <option value="" disabled>No categories found</option>
            )}
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
            {categories.length}
          </p>
        </div>
      </div>

      {/* Products List */}
      <div className="products-list-section">
        {products.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>No products found</h3>
            <p>{filters.category || filters.lowStock ? 'Try changing your filters' : 'Add your first product to get started'}</p>
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

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setEditingProduct(null);
          }}
          onSave={fetchDashboardData}
          product={editingProduct}
          categories={categories}
        />
      )}

      {/* Simple Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Manage Categories</h2>
              <button className="modal-close" onClick={() => setShowCategoryModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="categories-list">
                {categories.length === 0 ? (
                  <p className="text-muted">No categories yet. Add your first category!</p>
                ) : (
                  <ul>
                    {categories.map(category => (
                      <li key={category.id} className="category-item">
                        <span className="category-name">{category.name}</span>
                        <span className="category-count">({categoryCounts[category.name] || 0} products)</span>
                        <div className="category-actions">
                          <button 
                            className="btn btn-sm btn-outline"
                            onClick={() => {
                              setFilters({...filters, category: category.name});
                              setShowCategoryModal(false);
                            }}
                          >
                            Filter
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteCategory(category.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-primary"
                  onClick={handleAddCategory}
                >
                  + Add New Category
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowCategoryModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;