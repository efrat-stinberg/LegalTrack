import React, { useState } from 'react';
import axios from 'axios';
import { Client } from '../models/Client';

interface AddClientFormProps {
  onClientAdded?: (client: Client) => void;
}

const AddClientForm: React.FC<AddClientFormProps> = ({ onClientAdded }) => {
  const [client, setClient] = useState<Client>({
    fullName: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/client', client, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setClient({ fullName: '', email: '', phone: '' });
      if (onClientAdded) onClientAdded(response.data);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to add client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="fullName"
        placeholder="Full name"
        value={client.fullName}
        onChange={handleChange}
        required
      />
      <input
        name="email"
        placeholder="email"
        value={client.email}
        onChange={handleChange}
        required
        type="email"
      />
      <input
        name="phone"
        placeholder="phone"
        value={client.phone}
        onChange={handleChange}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Client'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default AddClientForm;
