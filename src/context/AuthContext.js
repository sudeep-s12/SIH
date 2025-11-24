//React contexts (e.g., AuthContext.js)

import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Dummy example - Replace with real auth logic
  useEffect(() => {
    const loggedInUser = null; // fetch from cookie/session
    setUser(loggedInUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
