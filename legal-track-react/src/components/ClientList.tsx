import { SetStateAction, useEffect, useState } from 'react';
import { Client } from '../models/Client';
import { getClients } from '../api/clientApi';

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    getClients()
      .then((response: { data: SetStateAction<Client[]>; }) => setClients(response.data))
      .catch((error: any) => console.error(error));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Clients</h2>
      <ul>
        {clients.map(client => (
          <li key={client.id} className="border-b py-2">
            {client.fullName} - {client.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
