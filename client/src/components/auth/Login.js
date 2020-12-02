import React, { useContext} from "react";
import { toast } from "react-toastify";
import styled ,{keyframes} from "styled-components";
import { connect } from "../../utils/fetchdata";
import useInput from "../../hooks/Modify";
import { UserContext } from "../../context/UserContext";
import logo from "../../assets/navlogo.png";
import "../../style/loginpage.css";
import Header from "./Header";

const FormStyle = keyframes`
from{
  transform:scale(-1,1);
}
to{
  transform:scale(1,1);
}
`;

export const FormWrapper = styled.div`
  background-color: ${(props) => props.theme.white};
  padding: 1rem;
  width: 350px;
  
  border: 1px solid ${(props) => props.theme.borderColor};
  margin: 10rem auto;  
  margin-right: 5%;
  text-align: center;
  padding: 2rem 0;

  float:right;
  animation: ${FormStyle} 1s linear;
  @media (max-width:1120px){
    width:350px;
    margin-left:100px;
    
  }
  @media(max-width:1020px){
    margin:100px;
  }
  @media(max-width:800px){
    margin:100px;
  }
  @media(max-width:530px){
    margin:auto;
    margin-bottom:15px;
  }
  @media (max-width:400px){
    width:100%;
   
  }

  img {
    margin-bottom: 1.5rem;
  }
  input {
    display: block;
    margin: 0 auto;
    margin-bottom: 1rem;
    padding: 0.5rem 1.2rem;
    color: ${(props) => props.theme.primaryColor};
    background: ${(props) => props.theme.white};
    border: 1px solid ${(props) => props.theme.borderColor};
    font-family: "Fira Sans", sans-serif;
    font-size: 1rem;
    border-radius: 4px;
    width: 85%;
  }
  
  input[type="submit"] {
    background-color: ${(props) => props.theme.blue};
    color: ${(props) => props.theme.white};
    border: 1px solid ${(props) => props.theme.blue};
    cursor: pointer;
  }
  .logo{
    width:200px;
    height:auto;
    margin-bottom:0.3rem;
  }
  p {
    margin-top: 2rem;
  }
  .info{
    font-size:17px;
    margin-bottom:12px;
    font-weight:bold;
    padding: 2px;
  }
  span {
    color: ${(props) => props.theme.blue};
    cursor: pointer;
  }
  
`;


const Login = ({ signup ,recover}) => {
  const { setUser } = useContext(UserContext);
  const id = useInput("");
  const password = useInput("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!id.value || !password.value) {
      return toast.error("Please fill in both the fields");
    }
    
    const body = { email: id.value, password: password.value,isStudent:true };

    try {
      const { token } = await connect("/auth/login", { body });
      localStorage.setItem("accesstoken", token);
    } catch (err) {
      return toast.error(err.message);
    }

    const user = await connect("/auth");
    localStorage.setItem("userdetail", JSON.stringify(user.data));
    setUser(user.data);
    toast.success("Login successful");    
    id.setValue("");
    password.setValue("");
  };

  return (
    <div className="welcome" style={{width:"100%"}}>
    <Header/>
    <FormWrapper onSubmit={handleLogin}>
      <img className="logo" src={logo} alt="logo" />
      <h2 className="info">Login to view all complaints lodged!</h2>
      <form>        
        <input
          type="text"
          placeholder="Username or email"
          value={id.value}
          onChange={id.onChange}
        />
        <input
          type="password"
          placeholder="yoursecretpassword"
          value={password.value}
          onChange={password.onChange}
        />
        <input type="submit" value="Log In" className="login-btn" />
      </form>

      <div>
      <div style={{marginBottom:"12px",marginTop:"18px"}}>
           <span onClick={recover}>Forgot password?</span>
        </div>
        <div>
          Don't have an account? <span onClick={signup}>Sign up</span>
        </div>
      </div>
    </FormWrapper>
    <div>
      <p className="footer">
        Created By Team 8
      </p>
      </div>
    </div>
  );
};

export default Login;