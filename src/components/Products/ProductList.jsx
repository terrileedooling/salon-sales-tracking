import { Edit2, Trash2, Eye } from 'lucide-react';
// import './ProductList.css';

const ProductList = ({ products, onEdit, onDelete, onView }) => {
  const getStockStatus = (stock, minStock) => {
    if (stock === 0) return { label: 'Out of Stock', class: 'out-of-stock' };
    if (stock <= minStock) return { label: 'Low Stock', class: 'low-stock' };
    return { label: 'In Stock', class: 'in-stock' };
  };

  return (
    <div className="products-table">
      <table className="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Cost</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Value</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const stockStatus = getStockStatus(product.stock, product.minStock);
            const stockValue = (product.price || 0) * (product.stock || 0);
            
            return (
              <tr key={product.id}>
                <td>
                  <div className="product-cell">
                    <div className="product-name">{product.name}</div>
                    <div className="product-sku">{product.sku || 'No SKU'}</div>
                  </div>
                </td>
                <td>{product.category || '-'}</td>
                <td>R{product.price?.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</td>
                <td>R{product.cost?.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</td>
                <td>
                  <div className="stock-cell">
                    <span className="stock-quantity">{product.stock || 0}</span>
                    <span className="stock-unit">{product.unit}</span>
                  </div>
                </td>
                <td>
                  <span className={`stock-badge ${stockStatus.class}`}>
                    {stockStatus.label}
                  </span>
                </td>
                <td>R{stockValue.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="icon-btn"
                      onClick={() => onView?.(product)}
                      title="View"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="icon-btn"
                      onClick={() => onEdit(product)}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="icon-btn danger"
                      onClick={() => onDelete(product.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;