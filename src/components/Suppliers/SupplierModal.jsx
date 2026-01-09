import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { X } from 'lucide-react';

const SupplierModal = ({ closeModal, refreshSuppliers }) => {
    const [formData, setFormData] = useState({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        mobile: "",
        address: "",
        active: true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "suppliers"), {
                ...formData,
                createdAt: serverTimestamp(),
                modifiedAt: serverTimestamp(),
            });
            refreshSuppliers();
            closeModal();
        } catch (error) {
            console.error("Error adding supplier:", error);
            alert("Failed to add supplier. Please try again.");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Add New Supplier</h2>
                    <button className="modal-close" onClick={closeModal}>
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
                                />
                            </div>
                        </div>
                        
                        <div className="checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={formData.active}
                                    onChange={handleChange}
                                />
                                Active Supplier
                            </label>
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={closeModal}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Add Supplier
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupplierModal;