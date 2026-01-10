import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // Import useAuth
import { firestoreService } from "../firebase/firestoreService"; // Import firestoreService
import SupplierList from "../components/Suppliers/SupplierList";
import SupplierModal from "../components/Suppliers/SupplierModal";
import SupplierViewModal from "../components/Suppliers/SupplierViewModal";
import SupplierDeleteModal from "../components/Suppliers/SupplierDeleteModal";
import '../styles/SuppliersPage.css';

const SuppliersPage = () => {
  const { user } = useAuth(); // Get current user
  const [suppliers, setSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch suppliers from Firestore - FILTERED BY USER ID
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        console.log("No user logged in");
        setSuppliers([]);
        return;
      }
      
      // Use firestoreService.getCollection with user.uid filter
      const suppliersData = await firestoreService.getCollection('suppliers', user.uid);
      setSuppliers(suppliersData);
      
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      alert("Error loading suppliers. Please refresh the page.");
      
      // Fallback: Try direct fetch if firestoreService fails
      try {
        const db = firestoreService.getFirestore(); // Assuming you have this method
        const { collection, getDocs, query, where } = await import("firebase/firestore");
        const q = query(collection(db, "suppliers"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const suppliersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSuppliers(suppliersData);
      } catch (fallbackError) {
        console.error("Fallback fetch also failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSuppliers();
    } else {
      setLoading(false);
      setSuppliers([]);
    }
  }, [user]);

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setViewModalOpen(true);
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDeleteSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setDeleteModalOpen(true);
  };

  const handleSupplierUpdated = () => {
    fetchSuppliers();
  };

  if (!user) {
    return (
      <div className="loading-container">
        <p>Please log in to view suppliers.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading suppliers...</p>
      </div>
    );
  }

  return (
    <div className="suppliers-container">
      <div className="page-header">
        <div>
          <h1>Suppliers</h1>
          <p className="page-subtitle">Manage your suppliers and vendor information</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setEditingSupplier(null);
              setIsModalOpen(true);
            }}
          >
            + Add Supplier
          </button>
        </div>
      </div>

      <SupplierList 
        suppliers={suppliers} 
        onView={handleViewSupplier}
        onEdit={handleEditSupplier}
        onDelete={handleDeleteSupplier}
      />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <SupplierModal 
          closeModal={() => {
            setIsModalOpen(false);
            setEditingSupplier(null);
          }}
          refreshSuppliers={handleSupplierUpdated}
          supplier={editingSupplier}
        />
      )}

      {/* View Details Modal */}
      {viewModalOpen && selectedSupplier && (
        <SupplierViewModal
          supplier={selectedSupplier}
          closeModal={() => {
            setViewModalOpen(false);
            setSelectedSupplier(null);
          }}
          onEdit={() => {
            setViewModalOpen(false);
            handleEditSupplier(selectedSupplier);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedSupplier && (
        <SupplierDeleteModal
          supplier={selectedSupplier}
          closeModal={() => {
            setDeleteModalOpen(false);
            setSelectedSupplier(null);
          }}
          refreshSuppliers={handleSupplierUpdated}
        />
      )}
    </div>
  );
};

export default SuppliersPage;