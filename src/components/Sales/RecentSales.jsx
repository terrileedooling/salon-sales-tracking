import { useState } from 'react';
import { format } from 'date-fns';
import { 
  ShoppingBag, 
  User, 
  CreditCard, 
  DollarSign,
  Eye,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import '../../styles/Sales.css';

const RecentSales = ({ sales, limit = 5 }) => {
  const [expandedSale, setExpandedSale] = useState(null);

  const formatCurrency = (amount) => {
    return `R${(amount || 0).toLocaleString('en-ZA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, HH:mm');
    } catch {
      return dateString;
    }
  };

  const getPaymentIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'card':
        return <CreditCard size={14} />;
      case 'cash':
        return <DollarSign size={14} />;
      default:
        return <ShoppingBag size={14} />;
    }
  };

  const getPaymentColor = (method) => {
    switch (method?.toLowerCase()) {
      case 'card':
        return '#3b82f6';
      case 'cash':
        return '#10b981';
      case 'eft':
        return '#f59e0b';
      case 'credit':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const toggleSaleDetails = (saleId) => {
    setExpandedSale(expandedSale === saleId ? null : saleId);
  };

  const calculateAverageOrderValue = () => {
    if (sales.length === 0) return 0;
    const total = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    return total / sales.length;
  };

  const calculateGrowth = () => {
    // This would compare with previous period
    // For now, return a dummy value
    return 5.2;
  };

  if (!sales || sales.length === 0) {
    return (
      <div className="recent-sales empty">
        <div className="empty-state">
          <ShoppingBag size={48} className="empty-icon" />
          <h4>No Recent Sales</h4>
          <p>Create your first sale to see it appear here</p>
        </div>
      </div>
    );
  }

  const recentSales = sales.slice(0, limit);
  const avgOrderValue = calculateAverageOrderValue();
  const growth = calculateGrowth();

  return (
    <div className="recent-sales">
      {/* Summary */}
      <div className="sales-summary">
        <div className="summary-item">
          <span className="summary-label">Recent Orders</span>
          <span className="summary-value">{recentSales.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Avg. Order</span>
          <span className="summary-value">{formatCurrency(avgOrderValue)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Growth</span>
          <span className={`summary-value ${growth >= 0 ? 'positive' : 'negative'}`}>
            {growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(growth).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Sales List */}
      <div className="sales-list">
        {recentSales.map((sale) => (
          <div key={sale.id} className={`sale-item ${expandedSale === sale.id ? 'expanded' : ''}`}>
            <div className="sale-header" onClick={() => toggleSaleDetails(sale.id)}>
              <div className="sale-info">
                <div className="sale-icon" style={{ background: getPaymentColor(sale.paymentMethod) }}>
                  {getPaymentIcon(sale.paymentMethod)}
                </div>
                <div className="sale-details">
                  <div className="sale-time">{formatDate(sale.time || sale.createdAt)}</div>
                  <div className="sale-customer">
                    <User size={12} />
                    <span>{sale.customerName || 'Walk-in Customer'}</span>
                  </div>
                </div>
              </div>
              
              <div className="sale-amount">
                <span className="amount">{formatCurrency(sale.total)}</span>
                <div className="items-count">
                  {sale.items?.length || 0} items
                </div>
              </div>
              
              <button 
                className="view-details-btn"
                onClick={() => toggleSaleDetails(sale.id)}
              >
                <Eye size={14} />
              </button>
            </div>

            {/* Expanded Details */}
            {expandedSale === sale.id && (
              <div className="sale-details-expanded">
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Sale ID:</span>
                    <span className="detail-value">{sale.id.substring(0, 12)}...</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{formatDate(sale.time || sale.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payment:</span>
                    <span className="detail-value">
                      <span 
                        className="payment-badge" 
                        style={{ background: getPaymentColor(sale.paymentMethod) }}
                      >
                        {sale.paymentMethod || 'cash'}
                      </span>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value status-completed">Completed</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="items-list">
                  <h5>Items ({sale.items?.length || 0})</h5>
                  {sale.items?.map((item, index) => (
                    <div key={index} className="item-row">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">×{item.quantity}</span>
                      <span className="item-price">{formatCurrency(item.price)}</span>
                      <span className="item-total">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="sale-totals">
                  <div className="total-row">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(sale.subtotal)}</span>
                  </div>
                  {sale.discount > 0 && (
                    <div className="total-row">
                      <span>Discount:</span>
                      <span className="discount">-{formatCurrency(sale.discountAmount || 0)}</span>
                    </div>
                  )}
                  <div className="total-row">
                    <span>Tax:</span>
                    <span>{formatCurrency(sale.taxAmount || 0)}</span>
                  </div>
                  <div className="total-row grand-total">
                    <span>Total:</span>
                    <span>{formatCurrency(sale.total)}</span>
                  </div>
                </div>

                {sale.notes && (
                  <div className="sale-notes">
                    <h5>Notes</h5>
                    <p>{sale.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View All Link */}
      {sales.length > limit && (
        <div className="view-all-container">
          <a href="/sales" className="view-all-link">
            View All Sales ({sales.length})
          </a>
        </div>
      )}
    </div>
  );
};

export default RecentSales;