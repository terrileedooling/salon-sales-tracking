import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../firebase/firestoreService';
import { X, Plus } from 'lucide-react';
import '../../styles/ProductModal.css';

const ProductModal = ({ isOpen, onClose, onSave, product, categories = [] }) => {
  const { user } = useAuth();
  if (!user) return null;

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingSupplier, setAddingSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierContact, setNewSupplierContact] = useState('');
  
  // Store the original product data when editing
  const [originalProduct, setOriginalProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    supplierId: '',
    minStock: 10,
    unit: 'unit',
    barcode: ''
  });

  // When product changes (editing), store the original and populate form
  useEffect(() => {
    if (product) {
      // Store the original product data
      setOriginalProduct({...product});
      
      // Populate form with product data when editing
      setFormData({
        name: product.name || '',
        description: product.description || '',
        sku: product.sku || '',
        category: product.category || '',
        price: product.price ? product.price.toString() : '',
        cost: product.cost ? product.cost.toString() : '',
        stock: product.stock ? product.stock.toString() : '',
        supplierId: product.supplierId || '',
        minStock: product.minStock ? product.minStock.toString() : '10',
        unit: product.unit || 'unit',
        barcode: product.barcode || ''
      });
    } else {
      // Reset everything when adding new product
      setOriginalProduct(null);
      resetForm();
    }
  }, [product]);

  useEffect(() => {
    if (!isOpen || !user) return;
    fetchSuppliers();
  }, [isOpen, user]);

  const fetchSuppliers = async () => {
    try {
      const sups = await firestoreService.getCollection('suppliers', user.uid);
      setSuppliers(sups);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sku: '',
      category: '',
      price: '',
      cost: '',
      stock: '',
      supplierId: '',
      minStock: '10',
      unit: 'unit',
      barcode: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare the data for saving - only send what's changed
      const productData = {
        // Always include these required fields
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category.trim() || null,
        price: parseFloat(formData.price) || 0,
        cost: parseFloat(formData.cost) || 0,
        stock: parseInt(formData.stock) || 0,
        minStock: parseInt(formData.minStock) || 10,
        unit: formData.unit,
        barcode: formData.barcode.trim() || null,
        updatedAt: new Date().toISOString()
      };

      // Only add SKU if it's provided (or generate for new product)
      if (formData.sku.trim()) {
        productData.sku = formData.sku.trim();
      } else if (!product) {
        // Only generate SKU for new products, not when editing
        productData.sku = generateSKU();
      }

      // Only add supplierId if it's provided
      if (formData.supplierId) {
        productData.supplierId = formData.supplierId;
      }

      if (product) {
        // For editing, preserve original created date
        productData.createdAt = originalProduct.createdAt || new Date().toISOString();
        await firestoreService.updateDocument('products', product.id, productData);
      } else {
        // For new products, add creation date and userId
        productData.createdAt = new Date().toISOString();
        productData.userId = user.uid;
        await firestoreService.addDocument('products', productData);
      }

      onSave();
      onClose();
      resetForm();
      setOriginalProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSKU = () => {
    const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : 'PRO';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${random}`;
  };

  const handleAddCategory = () => {
    const newCategory = prompt('Enter new category name:');
    if (newCategory && newCategory.trim()) {
      setFormData({ ...formData, category: newCategory.trim() });
    }
  };

  const handleAddSupplier = async () => {
    setAddingSupplier(true);
  };

  const handleSaveNewSupplier = async () => {
    if (!newSupplierName.trim()) {
      alert('Supplier name is required');
      return;
    }

    if (!newSupplierContact.trim()) {
      alert('Contact person is required');
      return;
    }

    try {
      const supplierData = {
        name: newSupplierName.trim(),
        contactPerson: newSupplierContact.trim(),
        active: true,
        email: newSupplierEmail.trim() || '',
        phone: newSupplierPhone.trim() || '',
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newSupplier = await firestoreService.addDocument('suppliers', supplierData);
      
      // Add the new supplier to local state
      setSuppliers([...suppliers, { id: newSupplier.id, ...supplierData }]);
      
      // Set the new supplier as selected
      setFormData({ ...formData, supplierId: newSupplier.id });
      
      // Reset supplier form
      setNewSupplierName('');
      setNewSupplierEmail('');
      setNewSupplierPhone('');
      setNewSupplierContact('');
      setAddingSupplier(false);
      
      alert('Supplier added successfully!');
    } catch (error) {
      console.error('Error adding supplier:', error);
      alert('Error adding supplier: ' + error.message);
    }
  };

  const handleCancelAddSupplier = () => {
    setAddingSupplier(false);
    setNewSupplierName('');
    setNewSupplierEmail('');
    setNewSupplierPhone('');
    setNewSupplierContact('');
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-lg">
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Basic Information */}
            <div className="form-section">
              <h3 className="form-section-title">Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Product Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    placeholder="Enter product name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    placeholder={product ? "Keep existing SKU" : "Auto-generated if empty"}
                    readOnly={!!product && !!product.sku} // Make SKU read-only when editing existing product
                  />
                  {product && product.sku && (
                    <small className="form-help">SKU cannot be changed for existing products</small>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <div className="input-with-button">
                    <select
                      className="form-input"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={handleAddCategory}
                      title="Add new category"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Supplier</label>
                  {addingSupplier ? (
                    <div className="new-supplier-form">
                      <div className="form-group">
                        <label className="form-label required">Supplier Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newSupplierName}
                          onChange={(e) => setNewSupplierName(e.target.value)}
                          placeholder="Enter supplier name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label required">Contact Person</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newSupplierContact}
                          onChange={(e) => setNewSupplierContact(e.target.value)}
                          placeholder="Enter contact person name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-input"
                          value={newSupplierEmail}
                          onChange={(e) => setNewSupplierEmail(e.target.value)}
                          placeholder="supplier@example.com"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          className="form-input"
                          value={newSupplierPhone}
                          onChange={(e) => setNewSupplierPhone(e.target.value)}
                          placeholder="0751232344"
                        />
                      </div>
                      <div className="supplier-form-actions">
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={handleSaveNewSupplier}
                        >
                          Save Supplier
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={handleCancelAddSupplier}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="input-with-button">
                      <select
                        className="form-input"
                        value={formData.supplierId}
                        onChange={(e) => handleInputChange('supplierId', e.target.value)}
                      >
                        <option value="">Select Supplier</option>
                        {suppliers.map(sup => (
                          <option key={sup.id} value={sup.id}>
                            {sup.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={handleAddSupplier}
                        title="Add new supplier"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="form-section">
              <h3 className="form-section-title">Pricing & Stock</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Selling Price (R)</label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">R</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      required
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Cost Price (R)</label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">R</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      value={formData.cost}
                      onChange={(e) => handleInputChange('cost', e.target.value)}
                      placeholder={originalProduct?.cost ? originalProduct.cost.toString() : "0.00"}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Current Stock</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    placeholder={originalProduct?.stock ? originalProduct.stock.toString() : "0"}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Minimum Stock Level</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={formData.minStock}
                    onChange={(e) => handleInputChange('minStock', e.target.value)}
                    placeholder={originalProduct?.minStock ? originalProduct.minStock.toString() : "10"}
                  />
                  <small className="form-help">Alert when stock falls below this level</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Unit of Measurement</label>
                  <select
                    className="form-input"
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                  >
                    <option value="unit">Unit</option>
                    <option value="ml">ml</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="l">Liter</option>
                    <option value="pack">Pack</option>
                    <option value="box">Box</option>
                    <option value="pair">Pair</option>
                    <option value="set">Set</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Barcode / ISBN</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                    placeholder={originalProduct?.barcode || "Optional"}
                  />
                </div>
              </div>
            </div>

            {/* Profit Calculation Preview */}
            {formData.price && formData.cost && parseFloat(formData.cost) > 0 && (
              <div className="form-section">
                <h3 className="form-section-title">Profit Preview</h3>
                <div className="profit-preview">
                  <div className="profit-row">
                    <span>Markup:</span>
                    <span className={parseFloat(formData.price) > parseFloat(formData.cost) ? 'profit-positive' : 'profit-negative'}>
                      {parseFloat(formData.cost) > 0
                        ? `${(((parseFloat(formData.price) - parseFloat(formData.cost)) / parseFloat(formData.cost)) * 100).toFixed(1)}%`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="profit-row">
                    <span>Profit per unit:</span>
                    <span className={parseFloat(formData.price) > parseFloat(formData.cost) ? 'profit-positive' : 'profit-negative'}>
                      R{(parseFloat(formData.price) - parseFloat(formData.cost)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
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
              disabled={loading || !formData.name.trim() || !formData.price}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : product ? (
                'Update Product'
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;