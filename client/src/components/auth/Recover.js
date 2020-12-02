import React, {useState } from "react";
import { toast } from "react-toastify";
import { connect } from "../../utils/fetchdata";
import { FormWrapper } from "./Login";
import modify from "../../hooks/Modify";
import logo from "../../assets/navlogo.png";
import "../../style/loginpage.css";
import Header from "./Header";


const Recover = ({login})=>{
    const [OTPB,setOTPB] = useState(false);
    const email = modify("");
    const OTP = modify("");
    const password = modify("");    
    const [val,setVal] = useState("Request OTP");
    const [dis,setDis] = useState("disabled");
    const [disotp,setDisOTP] = useState("");

    const RequestOTP = ()=>{
        if(!email.value){
            return toast.error("Please enter your email")
        }
        setDisOTP("disabled");
        const body = {
            email:email.value
        }
        connect('/auth/recoveryOTP',{body}).then(()=>{
            setDisOTP("");
            setVal("Resend OTP");
            setOTPB(true);
            setDis("");
            return toast.success("Enter the otp you just received on your email");
        }).catch((err)=>{
            setDisOTP("");
            return toast.error(err.message);
        })
    }
    
    const Recoveraccount = (e)=>{
        e.preventDefault();
        if(!OTP.value){
            return toast.error("Kindly enter your OTP");
        }
        setDis("disabled");
        setDisOTP("disabled");
        const body = {
            email:email.value,
            password:password.value,
            OTP:parseInt(OTP.value)
        }
        connect('/auth/forgetpassword',{body}).then((data)=>{
            console.log(data);            
            localStorage.setItem('userdetail',JSON.stringify(data.user));
            localStorage.setItem('accesstoken',data.token);
            window.location.reload();
        }).catch(err=>{
            setDis("");
            setDisOTP("");
            return toast.error(err.message);
        })
    }
    return (
        <div className="welcome" style={{width:"100%"}}>
            <Header/>
        <FormWrapper onSubmit={Recoveraccount} >
        <img className="logo" src={logo} alt="logo" />
      <h2 className="info">Recover your account</h2>
      <form>
          {!OTPB&&(                   
        <input
          type="email"
          placeholder="Enter your email"
          value={email.value}
          onChange={email.onChange}
        />        
          )
          }
        
        {OTPB&&(<>
            <input 
          type="password"         
          placeholder="Enter new password"          
          value={password.value}
          onChange={password.onChange}
          /> 
            <input 
          type="number"         
          placeholder="Enter OTP"         
          onChange={OTP.onChange}
          />   
        <input
          type="submit"         
          value="submit"
          disabled={dis}                  
        />
        </>)
        }
        <input
          type="button"          
          style={{background:"#00FF10",fontWeight:"bold",color:"#000000",cursor:"pointer"}}
          value={val}
          disabled={disotp}
          onClick={RequestOTP}         
        />
         
        </form>
        <div>
      <p>
          Back to login? <span onClick={login}>click</span>
        </p>
        </div>
        </FormWrapper>
        <div>
      <p className="footer">
        Created By Team 8
      </p>
      </div>
        </div>

    )
}
export default Recover;