import React from "react";
import AddClientForm from "../components/AddClientForm";

const ClientsPage: React.FC = () => {
  const handleClientAdded = (newClient: any) => {
    // אפשר לעדכן רשימת לקוחות אם יש צורך
    console.log("Client added:", newClient);
  };

  return (
    <div>
      <h2>Add New Client</h2>
      <AddClientForm onClientAdded={handleClientAdded} />
    </div>
  );
};

export default ClientsPage;
