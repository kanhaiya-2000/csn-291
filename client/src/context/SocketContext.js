import React, { useState, createContext } from "react";
import io from "socket.io-client";
export const SocketContext = createContext(null);
//http://localhost:55000 https://complaintlodger.herokuapp.com
const socket = io("https://complaintlodger.herokuapp.com",{
    query:{
        token:localStorage.getItem('accesstoken')
    }
});
export const SocketProvider = ({ children }) => {
  const [Socket, setSocket] = useState(socket);

  return (
    <SocketContext.Provider value={{ Socket, setSocket }}>
      {children}
    </SocketContext.Provider>
  );
};


export default SocketProvider;


