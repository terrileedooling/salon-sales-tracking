import { useState, useEffect } from 'react';
import { firestoreService } from '../../firebase/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  DollarSign,
  User,
  Plus,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import SaleModal from './SaleModal';
import '../../styles/Sales.css';

const SalesList = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    averageSale: 0,
    todaySales: 0
  });

  useEffect(() => {
    if (user) {
      fetchSales();
    }
  }, [user]);

  const fetchSales = async (filters = {}) => {
    setLoading(true);
    try {
      const salesData = await firestoreService.getCollection('sales', user.uid, filters);
      setSales(salesData);
      calculateStats(salesData);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (salesData) => {
    const totalSales = salesData.length;
    const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Today's sales
    const today = new Date().toISOString().split('T')[0];
    const todaySales = salesData.filter(sale => {
      const saleDate = sale.date || sale.createdAt?.toISOString().split('T')[0];
      return saleDate === today;
    }).reduce((sum, sale) => sum + (sale.total || 0), 0);

    setStats({
      totalSales,
      totalRevenue,
      averageSale,
      todaySales
    });
  };

  const handleSearch = () => {
    const filters = {};
    if (searchTerm) {
      // Search by customer name or sale ID
      // Note: This would require proper implementation based on your data structure
    }
    if (dateRange.start) filters.startDate = dateRange.start;
    if (dateRange.end) filters.endDate = dateRange.end;
    
    fetchSales(filters);
  };

  const handleDelete = async () => {
    if (!saleToDelete) return;
    
    try {
      // Restore product stock before deleting
      if (saleToDelete.items) {
        await Promise.all(saleToDelete.items.map(async (item) => {
          const product = await firestoreService.getDocument('products', item.productId);
          if (product) {
            const newStock = (product.stock || 0) + item.quantity;
            await firestoreService.updateDocument('products', item.productId, {
              stock: newStock
            });
          }
        }));
      }
      
      await firestoreService.deleteDocument('sales', saleToDelete.id);
      fetchSales(); // Refresh list
      setShowDeleteConfirm(false);
      setSaleToDelete(null);
    } catch (error) {
      console.error('Error deleting sale:', error);
      alert('Error deleting sale: ' + error.message);
    }
  };

  const handleEditSale = (sale) => {
    setEditingSale(sale);
    setShowSaleModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return `R${(amount || 0).toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Customer', 'Items', 'Subtotal', 'Discount', 'Tax', 'Total', 'Payment Method'];
    const csvData = sales.map(sale => [
      sale.date || '',
      sale.time ? formatDate(sale.time) : '',
      sale.customerName || 'Walk-in',
      sale.items?.length || 0,
      sale.subtotal || 0,
      sale.discount || 0,
      sale.tax || 0,
      sale.total || 0,
      sale.paymentMethod || 'cash'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && sales.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading sales data...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Sales History</h1>
          <p className="page-subtitle">Manage your sales transactions</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setEditingSale(null);
              setShowSaleModal(true);
            }}
          >
            <Plus size={16} />
            New Sale
          </button>
          <button className="btn btn-secondary" onClick={exportToCSV}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3b82f6' }}>
            <DollarSign size={20} />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#10b981' }}>
            <Calendar size={20} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalSales}</h3>
            <p>Total Sales</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f59e0b' }}>
            <DollarSign size={20} />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.averageSale)}</h3>
            <p>Average Sale</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ef4444' }}>
            <Calendar size={20} />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.todaySales)}</h3>
            <p>Today's Sales</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-row">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <div className="date-filters">
            <div className="date-input">
              <label>From:</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>
            <div className="date-input">
              <label>To:</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
            <button className="btn btn-secondary" onClick={handleSearch}>
              <Filter size={16} />
              Apply Filters
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => {
                setSearchTerm('');
                setDateRange({ start: '', end: '' });
                fetchSales();
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Sale ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Payment Method</th>
              <th>Discount</th>
              <th>Tax</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  No sales found. Create your first sale!
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <div className="date-cell">
                      <div className="date">{formatDate(sale.time)}</div>
                      {sale.date && (
                        <div className="date-sub">{sale.date}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <code className="sale-id">{sale.id.substring(0, 8)}...</code>
                  </td>
                  <td>
                    <div className="customer-cell">
                      <User size={14} />
                      <span>{sale.customerName || 'Walk-in'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="items-count">
                      {sale.items?.length || 0}
                    </div>
                  </td>
                  <td>
                    <span className={`payment-badge ${sale.paymentMethod}`}>
                      {sale.paymentMethod || 'cash'}
                    </span>
                  </td>
                  <td className={sale.discount ? 'discount-cell' : ''}>
                    {sale.discount ? `-${formatCurrency(sale.discountAmount || 0)}` : '-'}
                  </td>
                  <td>{formatCurrency(sale.taxAmount || 0)}</td>
                  <td className="total-cell">
                    <strong>{formatCurrency(sale.total || 0)}</strong>
                  </td>
                  <td>
                    <div className="sales-action-buttons">
                      <button 
                        className="icon-btn view"
                        onClick={() => setSelectedSale(sale)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="icon-btn edit"
                        onClick={() => handleEditSale(sale)}
                        title="Edit Sale"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="icon-btn delete"
                        onClick={() => {
                          setSaleToDelete(sale);
                          setShowDeleteConfirm(true);
                        }}
                        title="Delete Sale"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sale Modal for creating/editing sales */}
      {showSaleModal && (
        <SaleModal
          isOpen={showSaleModal}
          onClose={() => {
            setShowSaleModal(false);
            setEditingSale(null);
          }}
          onSave={fetchSales}
          sale={editingSale}
        />
      )}

      {/* Sale Details Modal */}
      {selectedSale && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Sale Details</h2>
              <button className="modal-close" onClick={() => setSelectedSale(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="sale-detail-grid">
                <div className="detail-group">
                  <label>Sale ID:</label>
                  <span>{selectedSale.id}</span>
                </div>
                <div className="detail-group">
                  <label>Date:</label>
                  <span>{formatDate(selectedSale.time)}</span>
                </div>
                <div className="detail-group">
                  <label>Customer:</label>
                  <span>{selectedSale.customerName || 'Walk-in Customer'}</span>
                </div>
                <div className="detail-group">
                  <label>Payment Method:</label>
                  <span className={`payment-badge ${selectedSale.paymentMethod}`}>
                    {selectedSale.paymentMethod}
                  </span>
                </div>
              </div>
              
              <div className="sale-items-detail">
                <h3>Items</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items?.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="sale-totals-detail">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedSale.subtotal)}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="total-row discount">
                    <span>Discount ({selectedSale.discount}%):</span>
                    <span>-{formatCurrency(selectedSale.discountAmount)}</span>
                  </div>
                )}
                <div className="total-row">
                  <span>Tax ({selectedSale.tax}%):</span>
                  <span>{formatCurrency(selectedSale.taxAmount)}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedSale.total)}</span>
                </div>
              </div>
              
              {selectedSale.notes && (
                <div className="sale-notes">
                  <h3>Notes</h3>
                  <p>{selectedSale.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && saleToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this sale?</p>
              <p><strong>Sale ID:</strong> {saleToDelete.id.substring(0, 12)}...</p>
              <p><strong>Date:</strong> {formatDate(saleToDelete.time)}</p>
              <p><strong>Total:</strong> {formatCurrency(saleToDelete.total)}</p>
              
              <div className="modal-warning">
                ⚠️ This action will restore product stock and cannot be undone.
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDelete}
              >
                Delete Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SalesList;