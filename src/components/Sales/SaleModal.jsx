import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../firebase/firestoreService';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import '../../styles/Sales.css';

const SaleModal = ({ isOpen, onClose, onSave, sale }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
    paymentMethod: 'cash',
    discount: 0,
    tax: 0,
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (sale) {
        loadSaleData(sale);
      } else {
        resetForm();
      }
    }
  }, [isOpen, sale]);

  const fetchData = async () => {
    try {
      const [prods, custs] = await Promise.all([
        firestoreService.getCollection('products', user.uid),
        firestoreService.getCollection('customers', user.uid)
      ]);
      setProducts(prods);
      setCustomers(custs);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      paymentMethod: 'cash',
      discount: 0,
      tax: 15, // Default VAT for South Africa
      notes: ''
    });
    setCart([]);
  };

  const loadSaleData = (saleData) => {
    setFormData({
      customerId: saleData.customerId || '',
      paymentMethod: saleData.paymentMethod || 'cash',
      discount: saleData.discount || 0,
      tax: saleData.tax || 15,
      notes: saleData.notes || ''
    });
    setCart(saleData.items || []);
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        cost: product.cost,
        quantity: 1,
        stock: product.stock
      }]);
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    const product = cart.find(item => item.productId === productId);
    if (product && quantity > product.stock) {
      alert(`Only ${product.stock} units available in stock`);
      return;
    }
    
    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = (subtotal * formData.discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * formData.tax) / 100;
    const total = taxableAmount + taxAmount;
    
    return {
      subtotal,
      discountAmount,
      taxableAmount,
      taxAmount,
      total
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert('Please add at least one item to the sale');
      return;
    }
    
    setLoading(true);
    
    try {
      const totals = calculateTotals();
      const saleData = {
        ...formData,
        items: cart,
        ...totals,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toISOString()
      };

      // Update product stock
      await Promise.all(cart.map(async (item) => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const newStock = (product.stock || 0) - item.quantity;
          await firestoreService.updateDocument('products', product.id, {
            stock: newStock
          });
        }
      }));

      if (sale) {
        await firestoreService.updateDocument('sales', sale.id, saleData);
      } else {
        await firestoreService.addDocument('sales', saleData, user.uid);
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving sale:', error);
      alert('Error saving sale: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totals = calculateTotals();

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-xl">
        <div className="modal-header">
          <h2>{sale ? 'Edit Sale' : 'New Sale'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="sale-modal-body">
          <div className="sale-left-panel">
            {/* Product Selection */}
            <div className="product-selection">
              <h3>Products</h3>
              <div className="product-grid">
                {products
                  .filter(p => p.stock > 0)
                  .map(product => (
                    <button
                      key={product.id}
                      type="button"
                      className="product-card"
                      onClick={() => addToCart(product)}
                    >
                      <div className="product-card-name">{product.name}</div>
                      <div className="product-card-price">
                        R{product.price?.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="product-card-stock">
                        Stock: {product.stock}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
          
          <div className="sale-right-panel">
            {/* Shopping Cart */}
            <div className="shopping-cart">
              <h3>Shopping Cart</h3>
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <p>No items added yet</p>
                </div>
              ) : (
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.productId} className="cart-item">
                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-price">
                          R{item.price?.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="cart-item-controls">
                        <button
                          type="button"
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="number"
                          className="quantity-input"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                          min="1"
                          max={item.stock}
                        />
                        <button
                          type="button"
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="cart-item-total">
                        R{(item.price * item.quantity).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Sale Details Form */}
            <form onSubmit={handleSubmit} className="sale-details">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Customer</label>
                  <select
                    className="form-input"
                    value={formData.customerId}
                    onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                  >
                    <option value="">Walk-in Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-input"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="eft">EFT</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Discount (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                    min="0"
                    max="100"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Tax (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.tax}
                    onChange={(e) => setFormData({...formData, tax: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              
              {/* Totals */}
              <div className="sale-totals">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>R{totals.subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
                
                {formData.discount > 0 && (
                  <div className="total-row discount">
                    <span>Discount ({formData.discount}%):</span>
                    <span>-R{totals.discountAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                
                <div className="total-row">
                  <span>Tax ({formData.tax}%):</span>
                  <span>R{totals.taxAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div className="total-row grand-total">
                  <span>Total:</span>
                  <span>R{totals.total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading || cart.length === 0}
                >
                  {loading ? 'Processing...' : (sale ? 'Update Sale' : 'Complete Sale')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleModal;