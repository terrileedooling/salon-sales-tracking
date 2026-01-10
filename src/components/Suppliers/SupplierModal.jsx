import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { X } from 'lucide-react';
import { useAuth } from "../../context/AuthContext"; // Import useAuth

const SupplierModal = ({ closeModal, refreshSuppliers, supplier }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        mobile: "",
        address: "",
        active: true,
    });
    const [loading, setLoading] = useState(false);

    // Populate form when supplier prop changes (for editing)
    useEffect(() => {
        if (supplier) {
            setFormData({
                name: supplier.name || "",
                contactPerson: supplier.contactPerson || "",
                email: supplier.email || "",
                phone: supplier.phone || "",
                mobile: supplier.mobile || "",
                address: supplier.address || "",
                active: supplier.active !== undefined ? supplier.active : true,
            });
        } else {
            // Reset form for new supplier
            setFormData({
                name: "",
                contactPerson: "",
                email: "",
                phone: "",
                mobile: "",
                address: "",
                active: true,
            });
        }
    }, [supplier]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            alert("You must be logged in to save supplier");
            return;
        }
        
        setLoading(true);
        try {
            const supplierData = {
                ...formData,
                userId: user.uid,
                modifiedAt: serverTimestamp(),
            };

            if (supplier) {
                // Update existing supplier
                await updateDoc(doc(db, "suppliers", supplier.id), supplierData);
            } else {
                // Add new supplier
                await addDoc(collection(db, "suppliers"), {
                    ...supplierData,
                    createdAt: serverTimestamp(),
                });
            }
            
            refreshSuppliers();
            closeModal();
        } catch (error) {
            console.error("Error saving supplier:", error);
            alert(`Failed to ${supplier ? 'update' : 'add'} supplier. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{supplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
                    <button 
                        className="modal-close" 
                        onClick={closeModal}
                        disabled={loading}
                    >
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Supplier Name *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                placeholder="Enter supplier name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Contact Person *</label>
                            <input
                                type="text"
                                name="contactPerson"
                                className="form-input"
                                placeholder="Enter contact person name"
                                value={formData.contactPerson}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-input"
                                    placeholder="+27 79 123 4567"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Mobile (Optional)</label>
                            <input
                                type="tel"
                                name="mobile"
                                className="form-input"
                                placeholder="+27 82 123 4567"
                                value={formData.mobile}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Address (Optional)</label>
                            <textarea
                                name="address"
                                className="form-input"
                                placeholder="Enter full address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={formData.active}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                Active Supplier
                            </label>
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button 
                            type="button" 
                            className="btn btn-outline" 
                            onClick={closeModal}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (supplier ? 'Update Supplier' : 'Add Supplier')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupplierModal;