import { useState } from 'react';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Edit2, 
  Trash2, 
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const ProductCard = ({ 
  product, 
  onEdit, 
  onDelete, 
  onView,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate stock status
  const getStockStatus = () => {
    const { stock, minStock = 10 } = product;
    
    if (stock === 0) {
      return {
        label: 'Out of Stock',
        color: 'danger',
        icon: <AlertCircle size={14} />,
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-200'
      };
    }
    
    if (stock <= minStock) {
      return {
        label: 'Low Stock',
        color: 'warning',
        icon: <AlertCircle size={14} />,
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200'
      };
    }
    
    return {
      label: 'In Stock',
      color: 'success',
      icon: <CheckCircle size={14} />,
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200'
    };
  };

  // Calculate profit margin
  const getProfitMargin = () => {
    const { price = 0, cost = 0 } = product;
    if (!cost || cost === 0) return { margin: 0, isPositive: true };
    
    const margin = ((price - cost) / cost) * 100;
    return {
      margin: Math.round(margin * 10) / 10,
      isPositive: margin >= 0
    };
  };

  // Calculate stock value
  const getStockValue = () => {
    const { price = 0, stock = 0 } = product;
    return price * stock;
  };

  const stockStatus = getStockStatus();
  const profitMargin = getProfitMargin();
  const stockValue = getStockValue();

  return (
    <div 
      className={`product-card ${className} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-card-header">
        <div className="product-icon">
          <Package size={24} />
        </div>
        
        <div className="product-header-info">
          <div className="product-name-wrapper">
            <h3 className="product-name" title={product.name}>
              {product.name}
            </h3>
            {product.sku && (
              <span className="product-sku" title="SKU">
                #{product.sku}
              </span>
            )}
          </div>
          
          <div className="product-category">
            {product.category || 'Uncategorized'}
          </div>
        </div>
        
        <div className={`stock-status ${stockStatus.color}`}>
          <span className="status-icon">{stockStatus.icon}</span>
          <span className="status-label">{stockStatus.label}</span>
        </div>
      </div>

      {/* Product Description */}
      {product.description && (
        <div className="product-description">
          <p>{product.description}</p>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="product-metrics">
        <div className="metric">
          <div className="metric-label">Price</div>
          <div className="metric-value price">
            <DollarSign size={12} />
            <span>{product.price?.toLocaleString('en-ZA', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            }) || '0.00'}</span>
          </div>
        </div>
        
        <div className="metric">
          <div className="metric-label">Cost</div>
          <div className="metric-value cost">
            <DollarSign size={12} />
            <span>{product.cost?.toLocaleString('en-ZA', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            }) || '0.00'}</span>
          </div>
        </div>
        
        <div className="metric">
          <div className="metric-label">Stock</div>
          <div className="metric-value stock">
            <span className="stock-quantity">{product.stock || 0}</span>
            <span className="stock-unit">{product.unit || 'unit'}</span>
          </div>
        </div>
        
        <div className="metric">
          <div className="metric-label">Margin</div>
          <div className={`metric-value margin ${profitMargin.isPositive ? 'positive' : 'negative'}`}>
            {profitMargin.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{profitMargin.margin}%</span>
          </div>
        </div>
      </div>

      {/* Stock Value & Reorder Level */}
      <div className="product-details">
        <div className="detail-row">
          <span className="detail-label">Stock Value:</span>
          <span className="detail-value value">
            R{stockValue.toLocaleString('en-ZA', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </span>
        </div>
        
        <div className="detail-row">
          <span className="detail-label">Reorder At:</span>
          <span className="detail-value reorder">
            {product.minStock || 10} {product.unit || 'unit'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="product-actions">
        <button 
          className="action-btn view"
          onClick={() => onView?.(product)}
          title="View Details"
        >
          <Eye size={16} />
          <span>View</span>
        </button>
        
        <button 
          className="action-btn edit"
          onClick={() => onEdit(product)}
          title="Edit Product"
        >
          <Edit2 size={16} />
          <span>Edit</span>
        </button>
        
        <button 
          className="action-btn delete"
          onClick={() => onDelete(product.id)}
          title="Delete Product"
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>

      {/* Supplier Info (if available) */}
      {product.supplierName && (
        <div className="product-supplier">
          <span className="supplier-label">Supplier:</span>
          <span className="supplier-name" title={product.supplierName}>
            {product.supplierName}
          </span>
        </div>
      )}

      {/* Hover Effects */}
      <div className="card-glow"></div>
    </div>
  );
};

export default ProductCard;