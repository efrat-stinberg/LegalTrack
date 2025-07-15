import { useState } from 'react';
import { createClient } from '../api/clientApi';

export default function ClientForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClient(formData);
      alert('Client created!');
    } catch (error) {
      console.error(error);
      alert('Failed to create client');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-4">
      <input name="name" onChange={handleChange} placeholder="Name" className="border p-2" />
      <input name="email" onChange={handleChange} placeholder="Email" className="border p-2" />
      <input name="phone" onChange={handleChange} placeholder="Phone" className="border p-2" />
      <input name="address" onChange={handleChange} placeholder="Address" className="border p-2" />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">Save</button>
    </form>
  );
}
