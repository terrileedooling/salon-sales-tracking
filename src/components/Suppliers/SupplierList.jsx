import { Eye, Edit, Trash2 } from 'lucide-react';

const SupplierList = ({ suppliers, onView, onEdit, onDelete }) => {
  if (suppliers.length === 0) {
    return (
      <div className="empty-state">
        <div className="no-data">No suppliers found yet. Add your first supplier to get started.</div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Supplier Name</th>
            <th>Contact Person</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td>
                <strong>{supplier.name}</strong>
                {supplier.address && (
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {supplier.address.substring(0, 30)}...
                  </div>
                )}
              </td>
              <td>{supplier.contactPerson}</td>
              <td>
                {supplier.email ? (
                  <a href={`mailto:${supplier.email}`} className="contact-email">
                    {supplier.email}
                  </a>
                ) : (
                  <span style={{ color: '#9ca3af' }}>N/A</span>
                )}
              </td>
              <td>
                <div className="contact-phone">
                  {supplier.phone || supplier.mobile || 'N/A'}
                </div>
              </td>
              <td>
                <span className={`status-badge ${supplier.active ? 'active' : 'inactive'}`}>
                  {supplier.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <div className="supplier-action-buttons">
                  <button 
                    className="icon-btn view" 
                    title="View Details"
                    onClick={() => onView(supplier)}
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="icon-btn edit" 
                    title="Edit Supplier"
                    onClick={() => onEdit(supplier)}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="icon-btn delete" 
                    title="Delete Supplier"
                    onClick={() => onDelete(supplier)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierList;