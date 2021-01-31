import React, { useContext, useEffect ,useState} from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import Search from "./Search";
import { UserContext } from "../../context/UserContext";
import navlogo from "../../assets/navlogo.png";
import { HomeIcon, HighlightIcon, BellIcon, NewPostIcon, MsgIcon } from "../../Icons";
import { SocketContext } from "../../context/SocketContext";
import styled, { keyframes } from "styled-components";


const openModal = keyframes`
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
`;

export const ModalWrapper = styled.div`
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
  overflow: hidden;
  animation: ${openModal} 0.5s ease-in-out;
  .modal-content {
    background: black;
    border-radius: 4px;
    max-width:400px;
    margin: auto;
    justify-self: center;
  }
  .avatarwrap{
    width:100%;
    display:flex;
    justify-content:center;
    margin-top:12px;
  }
  .avatar{
    width:90px;
    height:90px;
    border-radius:100%;
    object-fit:cover;
    align-self:center;
  }
  .info{
    padding:20px;
    color:white;
    font-weight:bold;
    width:100%;
  }
  .callaction{
    width:100%;
    display:flex;
    justify-content:space-around;
    align-items:center;
    padding-top:10px;
  }
  .callaction span{
    width:100px;
    padding:5px;
    text-align:center;
    cursor:pointer;
    margin-bottom:10px;
    color:black;
    font-weight:bold;
    border-radius:10px;
  }
  
`;
const NavWrapper = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  background-color: ${(props) => props.theme.white};
  border-bottom: 1px solid ${(props) => props.theme.borderColor};
  padding: 1rem 0;
  z-index: 10;
  .nav-logo {
    position: relative;
    top: 6px;
  }
  .upper-wrapper,.lower-wrapper,.middle-wrapper{
    -webkit-box-align: stretch;
      -webkit-align-items: stretch;
      -ms-flex-align: stretch;
      align-items: stretch;
      border: 0 solid #000;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      display: -webkit-box;
      display: -webkit-flex;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -webkit-flex-direction: column;
      -ms-flex-direction: column;
      flex-direction: column;
      -webkit-flex-shrink: 0;
      -ms-flex-negative: 0;
      flex-shrink: 0;
      margin: 0;
      padding: 0;
      position: relative;
  }
  .upper-wrapper{
    position:absolute;
    display:none;
  }
  .middle-wrapper{    
      -webkit-box-align: center;
      -webkit-align-items: center;
      -ms-flex-align: center;
      align-items: center;
      border-radius: 100px;
      color: #fff;
      background-color:#ed4956;      
      font-size: 11px;
      font-weight: semibold;
      height: 18px;
      -webkit-box-pack: center;
      -webkit-justify-content: center;
      -ms-flex-pack: center;
      justify-content: center;
      min-width: 18px;    
  }
  .lower-wrapper{
    padding:0 3px;         
  }
  #noti-wrapper{
    top:-7px;
    right:38px;
  }
  #inb-wrapper{
    top:-7px;
    right:152px;
  }
  #noti-wrapper-mobile{
    top:-7px;
    left:70.5%;
  }
  svg{
    fill:${(props) => props.theme.primaryColor}
  }
  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 auto;
    width: 930px;
  }
  
  ul {
    display: flex;
    position: relative;
    top: 3px;
    list-style-type: none;
  }
  li {
    margin-left: 1rem;
  }
  .nav-logo{
    width:200px;
  }
  .mobile{
    display:none;
  }
  .mobile-direct{
    display:none;
  }
  @media screen and (max-width: 970px) {
    nav {
      width: 90%;
    }
  }
  @media screen and (max-width: 700px) {
   padding:0px;
    input {
      display: none;
    }
    .mobile-direct{
      display:block;
    }
    #inb-wrapper-mobile{
      top:-7px;
      left:9px;
    }
    .mobile{
      display:block;
      position:fixed;
      bottom:0px;
      background-color: ${(props) => props.theme.white};
      border-top: 1px solid ${(props) => props.theme.borderColor};
      justify-content:space-between;
      width:100%;
      padding:2px 5px;
      left:0;
      height:50px;
      margin-bottom:-2px;
    }
    ul{
      top:8px;
    }
    .navlink{
      display:none !important;
    }     
    
    .nav-logo{
      width:200px;
      margin:auto;
    }
  }
`;

const Nav = () => {
  const { user } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);
  const { Socket, setSocket } = useContext(SocketContext);
  const [callmodel,setCallModel] = useState(false);
  const[callaccepted,setCallAccepted] = useState(false);
  const [callinfo,setCallInfo] = useState("");
  const token = localStorage.getItem('accesstoken');
  const makeSocketConnection = () => {
    if (token && !Socket) {
      if (Socket.connected)
        return;
      Socket.connect();
      Socket.on("connect", () => {
        setSocket(Socket);

      })

      Socket.on('disconnect', () => {
        setSocket(null);
        //toast.error('Socket disconnected');                
        setTimeout(makeSocketConnection, 1000);
      })
    }
  };
  useEffect(() => {
    makeSocketConnection();
  })
  const handleCallResponse = (rejected)=>{ 
    console.log("call rejected ",rejected);   
    setCallModel(false);
    setCallAccepted(true);
    const k = setTimeout(()=>{setCallAccepted(false)},2000);
    if(rejected)
      Socket&&Socket.emit('callresponse',{from:callinfo.fromid,to:callinfo.toid,rejected:true});
    else{
      clearTimeout(k);
      Socket.emit("callresponse",{rejected:false,from:callinfo.fromid,to:callinfo.toid});
      let win;
      if(callinfo.video)
        win =  window.open('/chat/videocall/'+callinfo.fromid);
      else{
        win = window.open('/chat/voicecall/'+callinfo.fromid);
      }
      
      win.offertaker = true;
      win.openbyscript = true;
      win.othersocketid = callinfo.fromsocketId;
      setCallAccepted(true);
    }    
    setCallInfo(null);
  }
  useEffect(() => {
    Socket&&Socket.on('getcallrequest',function(data){
      if(callmodel||callaccepted)
         return;
        
     Socket&&Socket.emit('confirmation',{from:data.fromid,to:data.toid});
      setCallModel(true);
      setCallInfo(data);
    });
    Socket&&Socket.on('removecallingmodel',function(){
      console.log("");
      setCallModel(false);
      setCallInfo(null);
    })
    Socket && Socket.on('updatestate', function (data) {
      if(document.getElementById(data.data))
        document.getElementById(data.data).classList.remove("bold");
      if (data.length > 0) {
        if (document.getElementById('inb-count')) {
          document.getElementById('inb-count').textContent = data.length;
          document.getElementById('inb-wrapper').style.display = 'flex';
        }
        if (document.getElementById('inb-count-mobile')) {
          document.getElementById('inb-count-mobile').textContent = data.length;
          document.getElementById('inb-wrapper-mobile').style.display = 'flex';
        }
      }
      else {
        if (document.getElementById('inb-wrapper'))
          document.getElementById('inb-wrapper').style.display = 'none';
        if (document.getElementById('inb-wrapper-mobile'))
          document.getElementById('inb-wrapper-mobile').style.display = 'none';
      }
    })
  })
  return (
    <NavWrapper>
      {callmodel&&callinfo&&
      <ModalWrapper>
         <div className="modal-content">
           <div className="avatarwrap">
             <img src={callinfo.avatar} className="avatar"/>
           </div>
           <div className="info">
             {callinfo.from} is {callinfo.video?"video-calling":"voice-calling"} you
           </div>
           <div className="callaction">
             <span style={{background:"#0f0"}} onClick={()=>handleCallResponse(false)}>Accept</span>
             <span style={{background:"#f00"}} onClick={()=>handleCallResponse(true)}>Deny</span>
           </div>
         </div>
      </ModalWrapper>
      }
      <nav>
        <Link to="/">
          <img className="nav-logo" src={navlogo} alt="logo" />
        </Link>
        <Search />

        <li style={{ position: "fixed", top: "10px", right: "15px" }} className="mobile-direct">
          <Link to="/chat/inbox" >
            <MsgIcon />
            <div className="upper-wrapper" id="inb-wrapper-mobile"><div className="middle-wrapper"><div className="lower-wrapper" id="inb-count-mobile">0</div></div></div>
          </Link>
        </li>

        <ul className="navlink" style={{ display: "flex", alignItems: "center" }}>
          <li>
            <Link to="/" >
              <HomeIcon activeclassname="active" theme={theme} />
            </Link>
          </li>
          <li>
            <Link to="/chat/inbox" >
              <MsgIcon />
              <div className="upper-wrapper" id="inb-wrapper"><div className="middle-wrapper"><div className="lower-wrapper" id="inb-count">0</div></div></div>
            </Link>
          </li>
          <li>
            <Link to="/accounts/new" >
              <NewPostIcon activeclassname="active" theme={theme} />
            </Link>
          </li>
          <li>
            <Link to="/highlight">
              <HighlightIcon activeclassname="active" theme={theme} />
            </Link>
          </li>
          <li>
            <Link to="/accounts/notifications">
              <BellIcon activeclassname="active" theme={theme} />
              <div className="upper-wrapper" id="noti-wrapper"><div className="middle-wrapper"><div className="lower-wrapper" id="noti-count">0</div></div></div>
            </Link>
          </li>
          <li>
            <Link to={`/${user.username}`}>
              <img
                style={{
                  width: "24px",
                  height: "24px",
                  objectFit: "cover",
                  borderRadius: "12px",
                }}
                src={user.avatar}
                alt="avatar"
              />
            </Link>
          </li>
        </ul>
      </nav>
      <div className="mobile">
        <ul className="mobnavlink" style={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>
          <li>
            <Link to="/" >
              <HomeIcon activeclassname="active" theme={theme} />
            </Link>
          </li>
          <li>
            <Link to="/accounts/new" >
              <NewPostIcon activeclassname="active" theme={theme} />
            </Link>
          </li>
          <li>
            <Link to="/highlight">
              <HighlightIcon activeclassname="active" theme={theme} />
            </Link>
          </li>
          <li>
            <Link to="/accounts/notifications">
              <BellIcon activeclassname="active" theme={theme} />
              <div className="upper-wrapper" id="noti-wrapper-mobile"><div className="middle-wrapper"><div className="lower-wrapper" id="noti-count-mobile">0</div></div></div>
            </Link>
          </li>
          <li>
            <Link to={`/${user.username}`}>
              <img
                style={{
                  width: "24px",
                  height: "24px",
                  objectFit: "cover",
                  borderRadius: "12px",
                }}
                src={user.avatar}
                alt="avatar"
              />
            </Link>
          </li>
        </ul>
      </div>
    </NavWrapper>
  );
};

export default Nav;