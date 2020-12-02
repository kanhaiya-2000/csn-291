import React, { useState } from "react";
import Signup from "./Signup";
import Login from "./Login";
import Recover from "./Recover";

const Auth = () => {
  const [auth, setAuth] = useState(2);

  const login = () => setAuth(2);
  const signup = () => setAuth(1);
  const recover = ()=>setAuth(0);

  if (auth===1) {
    return <Signup login={login} />;
  }
  else if(auth===2)  {
    return <Login signup={signup} recover={recover}/>;
  }
  else{
    return <Recover login={login}/>
  }
};

export default Auth;