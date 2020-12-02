import React, { useState, createContext } from "react";

export const NoticeContext = createContext(null);

export const NoticeProvider = ({ children }) => {
  const [Notice, setNotice] = useState([]);

  return (
    <NoticeContext.Provider value={{ Notice, setNotice }}>
      {children}
    </NoticeContext.Provider>
  );
};

export default NoticeProvider;