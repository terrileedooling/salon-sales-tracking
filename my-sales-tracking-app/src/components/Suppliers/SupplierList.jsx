const SupplierList = ({ suppliers }) => {
    if (suppliers.length === 0) {
      return <p>No suppliers found yet.</p>;
    }
  
    return (
      <table border="1" cellPadding="10" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact Person</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td>{supplier.name}</td>
              <td>{supplier.contactPerson}</td>
              <td>{supplier.email}</td>
              <td>{supplier.mobile}</td>
              <td>{supplier.active ? "✅" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  export default SupplierList;
  