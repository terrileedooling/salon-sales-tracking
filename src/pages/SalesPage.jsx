import { useState } from 'react';
import SaleModal from '../components/Sales/SaleModal';
import SalesList from '../components/Sales/SalesList';
import { Plus } from 'lucide-react';

const SalesPage = () => {
  const [showSaleModal, setShowSaleModal] = useState(false);
  
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Sales</h1>
          <p className="page-subtitle">Manage your sales transactions</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowSaleModal(true)}
        >
          <Plus size={16} />
          New Sale
        </button>
      </div>
      
      {/* Add Sales List component here */}
      <SalesList />
      
      {showSaleModal && (
        <SaleModal
          isOpen={showSaleModal}
          onClose={() => setShowSaleModal(false)}
          onSave={() => {
            // Refresh sales list
            setShowSaleModal(false);
          }}
        />
      )}
    </div>
  );
};

export default SalesPage;