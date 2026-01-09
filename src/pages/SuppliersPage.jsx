import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import SupplierList from "../components/Suppliers/SupplierList";
import SupplierModal from "../components/Suppliers/SupplierModal";

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch suppliers from Firestore
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "suppliers"));
        const suppliersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSuppliers(suppliersData);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    fetchSuppliers();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Suppliers</h1>
      <button onClick={() => setIsModalOpen(true)}>+ Add Supplier</button>

      <SupplierList suppliers={suppliers} />

      {isModalOpen && (
        <SupplierModal 
          closeModal={() => setIsModalOpen(false)} 
          refreshSuppliers={() => window.location.reload()} 
        />
      )}
    </div>
  );
};

export default SuppliersPage;
