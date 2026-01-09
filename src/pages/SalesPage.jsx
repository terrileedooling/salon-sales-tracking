import { useState } from 'react';
import SaleModal from '../components/Sales/SaleModal';
import SalesList from '../components/Sales/SalesList';
import { Plus } from 'lucide-react';

const SalesPage = () => {
  const [showSaleModal, setShowSaleModal] = useState(false);
  
  return (
    <>
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
    </>
  );
};

export default SalesPage;