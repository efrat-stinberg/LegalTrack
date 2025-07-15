import React, { useState, useEffect } from 'react';
import { Client } from '../models/Client';
import ClientAutocomplete from './ClientAutocomplete';
import AddClientForm from './AddClientForm';

interface AddFolderFormProps {
  onAddFolder: (folderName: string, clientId: number | null) => Promise<void>;
  clients: Client[];
  selectedClientId: number | null;
  onSelectClient: (clientId: number | null) => void;
}

const AddFolderForm: React.FC<AddFolderFormProps> = ({
  onAddFolder,
  clients,
  selectedClientId,
  onSelectClient,
}) => {
  const [folderName, setFolderName] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync selectedClient object with selectedClientId prop
  useEffect(() => {
    const client = clients.find(c => c.id === selectedClientId) || null;
    setSelectedClient(client);
    console.log('Selected client updated:', client, 'ID:', selectedClientId);
  }, [selectedClientId, clients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      alert('אנא הזן שם תיקייה');
      return;
    }
    
    if (selectedClientId === null) {
      alert('אנא בחר לקוח');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onAddFolder(folderName.trim(), selectedClientId);
      setFolderName('');
      setSelectedClient(null);
      onSelectClient(null);
    } catch (error) {
      console.error('Error adding folder:', error);
      alert('שגיאה ביצירת תיקייה');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientAdded = (newClient: Client) => {
    setShowAddClientForm(false);
    const clientId = newClient.id || null;
    console.log('New client added:', newClient, 'ID:', clientId);
    onSelectClient(clientId);
  };

  const handleClientSelect = (client: Client | null) => {
    console.log('Client selected in autocomplete:', client);
    const clientId = client?.id || null;
    console.log('Client ID to set:', clientId);
    onSelectClient(clientId);
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <form onSubmit={handleSubmit} style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '1rem',
        padding: '1rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <div>
          <label htmlFor="folderName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            שם תיקייה:
          </label>
          <input
            id="folderName"
            type="text"
            placeholder="הזן שם תיקייה"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            לקוח:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <ClientAutocomplete
                clients={clients}
                value={selectedClient}
                onChange={handleClientSelect}
              />
            </div>
            <button 
              type="button" 
              onClick={() => setShowAddClientForm(s => !s)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap'
              }}
            >
              {showAddClientForm ? 'ביטול' : '+ לקוח חדש'}
            </button>
          </div>
        </div>

        {/* Debug info */}
        <div style={{ fontSize: '0.8rem', color: '#666', padding: '0.5rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          <div>Selected Client ID: {selectedClientId}</div>
          <div>Selected Client: {selectedClient ? `${selectedClient.fullName} (${selectedClient.email})` : 'None'}</div>
          <div>Folder Name: {folderName}</div>
          <div>Can Submit: {!isSubmitting && folderName.trim() && selectedClientId !== null ? 'Yes' : 'No'}</div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || !folderName.trim() || selectedClientId === null}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isSubmitting || !folderName.trim() || selectedClientId === null ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting || !folderName.trim() || selectedClientId === null ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          {isSubmitting ? 'יוצר תיקייה...' : 'יצירת תיקייה'}
        </button>
      </form>

      {showAddClientForm && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f0f8ff'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>הוספת לקוח חדש</h3>
          <AddClientForm onClientAdded={handleClientAdded} />
        </div>
      )}
    </div>
  );
};

export default AddFolderForm;