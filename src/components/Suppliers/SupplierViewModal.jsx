import { X, Edit, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const SupplierViewModal = ({ supplier, closeModal, onEdit }) => {
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        try {
            if (timestamp.toDate) {
                return format(timestamp.toDate(), 'MMM dd, yyyy HH:mm');
            }
            return format(new Date(timestamp), 'MMM dd, yyyy HH:mm');
        } catch {
            return 'Invalid date';
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Supplier Details</h2>
                    <button className="modal-close" onClick={closeModal}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="sale-detail-grid">
                        <div className="detail-group">
                            <label>Supplier ID:</label>
                            <span className="sale-id">{supplier.id.substring(0, 8)}...</span>
                        </div>
                        <div className="detail-group">
                            <label>Status:</label>
                            <span className={`status-badge ${supplier.active ? 'active' : 'inactive'}`}>
                                {supplier.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="detail-group">
                            <label>Supplier Name:</label>
                            <span><strong>{supplier.name}</strong></span>
                        </div>
                        <div className="detail-group">
                            <label>Contact Person:</label>
                            <span>{supplier.contactPerson}</span>
                        </div>
                    </div>
                    
                    <div className="sale-items-detail" style={{ marginTop: '1.5rem' }}>
                        <h3>Contact Information</h3>
                        <div className="detail-item" style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Mail size={16} />
                                <span>Email:</span>
                            </div>
                            <span>{supplier.email || 'N/A'}</span>
                        </div>
                        <div className="detail-item" style={{ padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Phone size={16} />
                                <span>Phone:</span>
                            </div>
                            <span>{supplier.phone || supplier.mobile || 'N/A'}</span>
                        </div>
                        {supplier.address && (
                            <div className="detail-item" style={{ padding: '0.75rem 0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={16} />
                                    <span>Address:</span>
                                </div>
                                <span>{supplier.address}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="sale-totals-detail" style={{ marginTop: '1.5rem' }}>
                        <div className="detail-item" style={{ padding: '0.5rem 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={16} />
                                <span>Created:</span>
                            </div>
                            <span>{formatDate(supplier.createdAt)}</span>
                        </div>
                        <div className="detail-item" style={{ padding: '0.5rem 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={16} />
                                <span>Last Modified:</span>
                            </div>
                            <span>{formatDate(supplier.modifiedAt)}</span>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button 
                        className="btn btn-secondary" 
                        onClick={onEdit}
                    >
                        <Edit size={16} />
                        Edit Supplier
                    </button>
                    <button 
                        className="btn btn-outline" 
                        onClick={closeModal}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupplierViewModal;