import { X } from 'lucide-react';
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const SupplierDeleteModal = ({ supplier, closeModal, refreshSuppliers }) => {
    const handleDelete = async () => {
        try {
            await deleteDoc(doc(db, "suppliers", supplier.id));
            refreshSuppliers();
            closeModal();
        } catch (error) {
            console.error("Error deleting supplier:", error);
            alert("Failed to delete supplier. Please try again.");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Confirm Delete</h2>
                    <button className="modal-close" onClick={closeModal}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    <p>Are you sure you want to delete this supplier?</p>
                    <p><strong>Supplier Name:</strong> {supplier.name}</p>
                    <p><strong>Contact Person:</strong> {supplier.contactPerson}</p>
                    
                    <div className="modal-warning">
                        ⚠️ This action cannot be undone. All supplier information will be permanently deleted.
                    </div>
                </div>
                <div className="modal-footer">
                    <button 
                        className="btn btn-secondary" 
                        onClick={closeModal}
                    >
                        Cancel
                    </button>
                    <button 
                        className="btn btn-danger" 
                        onClick={handleDelete}
                    >
                        Delete Supplier
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupplierDeleteModal;