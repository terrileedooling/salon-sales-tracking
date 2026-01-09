import { useState } from 'react';
import { FileText, Download, Printer } from 'lucide-react';

const InvoicesPage = () => {
  const [invoices] = useState([]); // You'll fetch these from Firebase
  
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Invoices</h1>
          <p className="page-subtitle">View and manage your invoices</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <Printer size={16} />
            Print All
          </button>
        </div>
      </div>
      
      {invoices.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <h3>No invoices yet</h3>
          <p>Create a sale to generate an invoice</p>
        </div>
      ) : (
        <div className="invoices-list">
          {/* Invoice list will go here */}
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;