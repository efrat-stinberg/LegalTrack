import React, { useState, useEffect } from 'react';
import { Client } from '../models/Client';

interface ClientAutocompleteProps {
  clients: Client[];
  value: Client | null;
  onChange: (client: Client | null) => void;
}

const ClientAutocomplete: React.FC<ClientAutocompleteProps> = ({
  clients,
  value,
  onChange,
}) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Sync input field with selected client
  useEffect(() => {
    if (value && value.fullName && value.email) {
      setQuery(`${value.fullName} (${value.email})`);
    } else {
      setQuery('');
    }
  }, [value]);

  const filtered = clients.filter((client) => {
    const name = client.fullName || '';
    const email = client.email || '';
    return (name.toLowerCase().includes(query.toLowerCase()) ||
           email.toLowerCase().includes(query.toLowerCase())) &&
           name && email; // רק לקוחות עם נתונים תקינים
  });

  const handleSelect = (client: Client) => {
    const name = client.fullName;
    const email = client.email;
    setQuery(`${name} (${email})`);
    onChange(client);
    setShowDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setShowDropdown(true);
    
    // אם השדה ריק, נבטל את הבחירה
    if (newQuery === '') {
      onChange(null);
    } else {
      // בדוק אם הטקסט המוקלד תואם בדיוק ללקוח קיים
      const exactMatch = clients.find(client => 
        `${client.fullName} (${client.email})` === newQuery
      );
      if (!exactMatch) {
        // אם אין התאמה מדויקת, נבטל את הבחירה
        onChange(null);
      }
    }
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputBlur = () => {
    // השהיה קצרה לאפשר לחיצה על פריט מהרשימה
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="חפש לקוח..."
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        style={{ 
          width: '100%', 
          padding: '0.5rem',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      />
      {showDropdown && query && filtered.length > 0 && (
        <ul style={{
          position: 'absolute',
          zIndex: 1000,
          width: '100%',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxHeight: '200px',
          overflowY: 'auto',
          marginTop: '2px',
          padding: 0,
          listStyle: 'none',
          margin: 0
        }}>
          {filtered.map((client) => {
            const name = client.fullName;
            const email = client.email;
            const id = client.id;
            return (
              <li 
                key={id ?? email}
                onClick={() => handleSelect(client)}
                style={{ 
                  padding: '0.75rem 0.5rem', 
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{name}</div>
                <div style={{ fontSize: '0.9em', color: '#666' }}>{email}</div>
              </li>
            );
          })}
        </ul>
      )}
      {showDropdown && query && filtered.length === 0 && (
        <div style={{
          position: 'absolute',
          zIndex: 1000,
          width: '100%',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginTop: '2px',
          padding: '0.75rem 0.5rem',
          color: '#666',
          fontSize: '0.9em'
        }}>
          לא נמצאו תוצאות
        </div>
      )}
    </div>
  );
};

export default ClientAutocomplete;