import React, { useState, createContext } from "react";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const userdetail = JSON.parse(localStorage.getItem("userdetail"));
  console.log(userdetail);
  const [user, setUser] = useState(userdetail ? userdetail : null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};