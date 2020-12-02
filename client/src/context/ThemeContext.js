import React, { useState, createContext } from "react";
import { darkTheme } from "../styles/theme";
import { lightTheme } from "../styles/theme";
export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {  
  const [theme, setTheme] = useState(localStorage.getItem('themepreference')==='light'?lightTheme:darkTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};