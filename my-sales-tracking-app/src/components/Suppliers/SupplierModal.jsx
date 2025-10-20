import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const SupplierModal = ({ closeModal, refreshSuppliers }) => {
    const [formData, setFormData] = useState({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        active: true,
    });

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData({
            ...formData,
            [name]: name === "checkbox" ? checked : value,
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "suppliers"), {
                ...formData,
                created: serverTimestamp(),
                modified: serverTimestamp(),
            });
            refreshSuppliers();
            closeModal();
        } catch (error) {
            console.error("Error adding supplier:", error);
        }
    };

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
                <h2>Add Supplier</h2>
                <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Supplier Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="contactPerson"
                        placeholder="Contact Person"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <input
                      type="text"
                      name="mobile"
                      placeholder="Mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                    />
                    <label>
                      Active:
                      <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleChange}
                      />
                    </label>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <button type="submit">Add Supplier</button>
                      <button type="button" onClick={closeModal}>
                        Cancel
                      </button>
                    </div>   
                </form>
            </div>
        </div>
    );
};

// Basic inline styles for modal
const modalStyles = {
    overlay: {
      position: "fixed",
      top: 0, left: 0,
      width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex", justifyContent: "center", alignItems: "center",
      zIndex: 1000,
    },
    modal: {
      backgroundColor: "#fff",
      padding: "20px",
      borderRadius: "8px",
      width: "400px",
      maxHeight: "90vh",
      overflowY: "auto",
    },
  };
  
  export default SupplierModal;
  