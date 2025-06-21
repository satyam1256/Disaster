import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock users and roles (should match backend)
const USERS = [
  { username: 'netrunnerX', role: 'admin' },
  { username: 'reliefAdmin', role: 'admin' },
  { username: 'volunteerJoe', role: 'contributor' },
  { username: 'demoUser', role: 'contributor' },
];

const UserContext = createContext();

export function UserProvider({ children }) {
  // Try to load from localStorage, else default to first user
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('selectedUser');
    return saved ? JSON.parse(saved) : USERS[0];
  });

  useEffect(() => {
    localStorage.setItem('selectedUser', JSON.stringify(user));
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, USERS }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
} 