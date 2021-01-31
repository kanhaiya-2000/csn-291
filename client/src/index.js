import React from 'react';
import ReactDOM from 'react-dom';
//import './style/index.css';
import App from './App';
import { UserProvider } from "./context/UserContext";
import { FeedProvider } from "./context/FeedContext";
import { ThemeProvider } from "./context/ThemeContext";
import {SocketProvider} from "./context/SocketContext";
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <UserProvider>
  <FeedProvider>
    <ThemeProvider>
      <SocketProvider>
      <App />
      </SocketProvider>
    </ThemeProvider>
  </FeedProvider>
</UserProvider>,
document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
