import React, { useEffect, useRef, useState,useContext } from "react";
import { Redirect, useHistory, useParams } from "react-router-dom";
import Linkify from 'react-linkify';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import styled from "styled-components";
import useLongPress from "../posts/useLongPress";
import Avatar from "../../styles/Avatar";
//import Loader from "../utility/Loader";
import { logout } from "../home/Home";
import Modal from "../posts/Modal";
//import io from "Socket.io-client";
import { connect, timeSince } from "../../utils/fetchdata";
import Placeholder from "../utility/Placeholder";
import { BackIcon,InboxIcon, VideoIcon, VoiceIcon } from "../../Icons";
import Modify from "../../hooks/Modify";
import { toast } from "react-toastify";
import { ModalContentWrapper } from "../posts/PostComponents";
import {ChatWrapper,ChatHeader, ChatListLoader} from "./Homechat";
import { SocketContext } from "../../context/SocketContext";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import {ThemeContext} from "../../context/ThemeContext";
export const MessageRoom = styled.div`
   html,body{
       overflow-y:hidden !important;
   }
   .unames{
       position:relative;
       top:15px;
       left:20px;
   }
   .self a{
       color:#38d567bf;
   }
   .infowrapper{
       position:relative;
       top:-5px;
       cursor:pointer;
   }
   .fname{      
       font-size:12px;
       top:-6px;
       color: ${(props) => props.theme.secondaryColor};
       position:relative;
   }
   .additional{
       width:72px;
       float:right;
       margin-right:12px;
       display:flex;
       flex-direction:row;
       justify-content:space-between;
       align-items:center;
       position:absolute;
       right:20px;       
   }
   .icon{
       padding:4px;
       margin-right:10px;
   }
   .intro{
    position: absolute !important;
    top: calc(50% - 100px) !important;
    display:flex;    
    flex-direction:column;
    left: calc(50% - 20px) !important;
}

.text{
    font-weight:bold;
    font-size:18px;
    padding-top:20px !important;    
}
.intro svg{
    transform:scale(2);
}
.intro *{
    align-self:center;
}
   .roomHeader{
       width:inherit;
       display:flex;
       position:fixed;
       top:0px;
       background:${(props) => props.theme.bg} ;
        padding:15px;
        border-bottom:1px solid ${(props) => props.theme.borderColor} ;
       height:60px;
       flex-wrap:nowrap; 
       z-index:30;      
       
   }
   .message{
    height:calc(100% - 135px);
    position:absolute;
    width:100%;
    overflow-y:scroll;
   }
   @media screen and (max-width:800px) and (min-width:700px){
       width:calc(100% - 100px);
       position:fixed;
       right:0;
       .footerchat{
        right:20px !important;
        width:calc(100% - 130px) !important;
    }
    .message{
        height:calc(100% - 200px) !important;
        top:70px !important;
    }
    .backbtn{
        display:none;
    }
    .roomHeader{
        top:77px;
    }
   }
  
   @media screen and (min-width:800px){
       width:calc(100% - 430px);
       position:fixed;
       right:0;
       
       .footerchat{
           right:20px !important;
           width:calc(100% - 450px) !important;
       }
       .message{
           height:calc(100% - 220px) !important;
           top:50px !important;
       }
       .backbtn{
           display:none;
       }
       .roomHeader{
           top:77px;
       }
   }
   .footerchat{       
       height:50px;
       display:flex;
       padding-bottom: 16px;
       background:${(props) => props.theme.bg} ;
       border:1px solid ${(props) => props.theme.borderColor} ;
       border-radius:22px;
       width:calc(100% - 20px);
       padding-left:10px;
       align-self:center;
       padding-top: 16px;
   }
   svg{
    fill:${(props) => props.theme.primaryColor}
}
svg[aria-label="Back"]{
    transform:rotate(-90deg);
    margin-right:15px;
}
#inputwrapper{
    width:calc(100% - 40px);
    display:flex;
}
.msgpiece{
    max-width:80%;
    min-width:100px;
    float:right;
    clear:both;
    margin:10px;
    margin-top:0;
}
.msgstatus {
	font-size: 14px;	
	margin: 0px !important;
    text-align: right;    
	margin-right: 25px !important;
}
.self,.stamp{
    padding-left:10px;
    word-break:break-word;
}
.msgwrapper{
    background: ${(props) => props.theme.chatColor};
    color: ${(props) => props.theme.primaryColor};
    display:flex;
    border:1px solid ${(props) => props.theme.borderColor};
    border-radius:22px;
    flex-direction:column;
    width:100%;
}
.msgwrapperd{
    background: ${(props) => props.theme.chatColor};
    color: ${(props) => props.theme.primaryColor};
    display:flex;    
    border-radius:22px;
    flex-direction:column;
    width:100%;
}
  input{
       height:18px;
       width:100%;
       align-self:center;
       font-size:16px;
       background-color: transparent;
       color:${(props) => props.theme.primaryColor};
       border: 0;
       overflow: auto;
       padding: 8px 9px;
       resize: none;       
   }
   .stamp{
       color:${(props) => props.theme.secondaryColor};
       font-size:13px;
   }
  
      width:100%;
      height:100%;
      display:flex;
      flex-direction:column;
      .footerchat{
          position:fixed;
          bottom:5px;
      }
      @media screen and (max-width:800px){
        .chatheader,.chatcomponent{
            display:none !important;
        }
    }
  
`;
const ModalContent = ({ msgId, closeModal, roomid,Socket,isMine,text}) => {
    const Deletemsg = () => {
        closeModal();
        Socket.emit('delete',{msgId,roomid});
    }
    return (
        <Modal>
            <ModalContentWrapper>
                <span className="danger" onClick={closeModal}>
                    Cancel
                 </span>
                 <CopyToClipboard text={text} onCopy={()=>{toast.success("Copied!");closeModal()}}><span>Copy</span></CopyToClipboard>
              {isMine&&<span className="danger" onClick={Deletemsg}>
                    Delete
            </span>}
           
            </ModalContentWrapper>
        </Modal>
    )
}
const Mainchat = () => {
    const { roomid } = useParams();
    const [users, setUsers] = useState([]);    
    const {Socket,setSocket} = useContext(SocketContext);
    const [Messages, setMessages] = useState([]);
    const [chatRoomid,setChatRoomid] = useState("");
    const token = localStorage.getItem('accesstoken');
    const [mobile,setMobile] = useState(false);
    const [msgstatus,showMsgStatus] = useState(false);
    const endRef = useRef(null);
    const inputRef = useRef(null);
    const [mine,setIsMine] = useState(false);
    const [msgId, setId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loading1, setLoading1] = useState(true);
    const [isLastMine,setIsLastMine] = useState(false);
    const theme2 = { fill: "#888" };
    const {theme} = useContext(ThemeContext);
    const color = theme.skeleton;
    const [err, setErr] = useState("");
    const inp = Modify("");
    const [showmodel, setShowModal] = useState(false);
    const [TXT,setCopyText] = useState("");
    const history = useHistory();
    const [user, setUser] = useState({});
    // const k = setTimeout(()=>{
    //     chatSocket&&chatSocket.emit('joinroom', roomid);
    //     chatSocket&&chatSocket.connected&&clearTimeout(k);
    // },3000);
    const scrollToend = () => {

        endRef.current&&endRef.current.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
    }

    const makeSocketConnection = () => {
        if (token && !Socket) {            
            if(Socket.connected)
               return;
            Socket.connect();
            Socket.on("connect", () => {
                setSocket(Socket);
               // //console.log(Messages);
                // toast.success("Socket connected");

            })
            
            Socket.on('errormsg',function(err){
                 toast.error(err);
            })
            if(Socket){
                Socket.emit('read',roomid);
            }
            Socket.on('disconnect', () => {
                setSocket(null);
                toast.error('Socket disconnected');                
                setTimeout(makeSocketConnection, 1000);
            })
        }
    };
    const onLongPress = () => {
        
        setShowModal(true);
    };

    const onClick = (e) => {
        
        //console.log('click is triggered')
    }
    const idsetter = (id,isMine,text)=>{
        //console.log(id);
        setIsMine(isMine);
        setId(id);
        setCopyText(text);
    }
    const closeModal = () => {
        setShowModal(false);
    }
    const defaultOptions = {
        shouldPreventDefault: true,
        delay: 700,
    };
    
    const longPressEvent = useLongPress(onLongPress, onClick, defaultOptions);
    useEffect(() => {
        if (window.innerWidth < 700) {
            setMobile(true);
            document.getElementsByTagName('nav')[0].style.display = "none";
            document.getElementsByClassName('mobile')[0].style.display = "none";
        }
    }, []);
    useEffect(() => {
        if(window.innerWidth>=700){
        connect('/user/chat', { method: "POST" }).then((chats) => {
            setUsers(chats.data.sort(function(a,b){return new Date(b.timeSince) - new Date(a.timeSince)}));
           // //console.log(chats.data);
            setLoading1(false);
        }).catch(err => {
            err.logout && logout();
            setLoading1(false);
            setErr(err.message);
        })
    }
    else{
        setLoading1(false);
    }
        connect('/chat/' + roomid, { method: "POST" }).then((detail) => {
            setMessages(detail.messages);
            showMsgStatus(detail.isSeen);
            setChatRoomid(detail.roomid);
           // //console.log(detail.messages);
            setUser(detail.user);
            setLoading(false);
            setTimeout(function(){
            scrollToend();
            if(document.getElementById(detail.roomid)){
                document.getElementById(detail.roomid).style.backgroundColor = theme.chatBg;
            }
            
        },1000)
            makeSocketConnection();
        }).catch(err => {
            err.logout && logout();
            setErr(err.message);
            setLoading(false);
        })
        return ()=>{
            if(Socket){
                Socket.off('errormsg');
                Socket.off('disconnect');
            }
        }
    }, []);
    useEffect(()=>{
        Socket&&Socket.emit('read',roomid);         
    });
    useEffect(()=>{
        Socket&&Socket.on('readmsg',function(data){
            showMsgStatus(isLastMine);            
            scrollToend();
        })
        return ()=>{
            Socket.off('readmsg');
        }
    })
    useEffect(()=>{        
        
        Socket&&Socket.on("msg", function (data) {
            showMsgStatus(false);
            if(data.roomid===roomid){
            //Messages.push(data.data);
            ////console.log(data);
            setIsLastMine(data.isMine);
            if(!data.isMine)
                Socket.emit('read',data.roomid);
            const newmsg = [...Messages, data];
            setMessages(newmsg);
            if(endRef?.current)
                scrollToend()
                if(document.getElementById(data.roomid)){
                    document.getElementById(data.roomid).textContent = data.text;                    
                    document.getElementById(data.roomid).nextElementSibling.textContent = timeSince(data.createdAt,true);
                }
           // //console.log("Socketdata", Messages);
        }
        else{
            if(mobile&&!data.isMine){
                toast.success("\n"+data.sender+": "+data.text.substring(0,20)+"...");
            }
            else if(document.getElementById(data.roomid)){
                document.getElementById(data.roomid).textContent = data.text;
                document.getElementById(data.roomid).classList.add("bold");                
                document.getElementById(data.roomid).nextElementSibling.textContent = timeSince(data.createdAt,true);
                if(!data.isMine)
                    toast.success("\n"+data.sender+": "+data.text.substring(0,20)+"...");
            }
            else{                
                //console.log('requesting verification');
                Socket.emit('requestverification',data.roomid);
                
            }
            
        }
        if(document.getElementById(data.roomid)){
            ////console.log(users);
            const user = users.filter(function(a){return a.id==data.chatRoomid});
            const user2 = users.filter(function(a){return a.id!=data.chatRoomid});
            user[0].timeSince = Date.now();
            const newdata = (user.concat(user2)).sort(function(a,b){return new Date(b.timeSince) - new Date(a.timeSince)});
            setUsers(newdata);
        }
        })
        Socket&&Socket.on('deletingmsg',function(id){
            document.getElementById(id.msgId)&&document.getElementById(id.msgId).remove();
        })
        return ()=>{
            if(Socket){
            Socket.off('deletingmsg');
            Socket.off('msg');          
            }
            if (!window.location.toString().includes('chat')&&window.innerWidth < 700){
                window.location.reload();            
        }
        }
        
    });
    const componentDecorator = (href, text, key) => (
        <a href={href} key={key} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      );
      
    useEffect(()=>{
        Socket&&Socket.on('addnewlist',function(data){
            //console.log('here');
            if(!document.getElementById(data.id)){
                setUsers([data,...users]);
                //toast.success("New message from "+data.username);
            }
        });
        return ()=>{
            if(Socket)
                Socket.off('addnewlist')
        }
    },[users,Socket])
    const handleCall=(Video)=>{
        if(localStorage.getItem('userdetail')){
            const myId = JSON.parse(localStorage.getItem('userdetail'))._id;
            const otheruserId = roomid.split('_').filter(function(t){
                return t!=myId;
            })[0];
            let win;
            if(Video){
               win = window.open('/chat/videocall/'+otheruserId);
            }
            else{
               win = window.open('/chat/voicecall/'+otheruserId);
            }
            win.openbyscript = true;
        }
    }
    const handleSubmit = (e) => {
        if (e.keyCode === 13) {
            scrollToend();
            showMsgStatus(false);
            ////console.log(Socket.id);
            Socket.emit("msg", { roomid: roomid, message: inp.value });
            inp.setValue("");
        }
    }
    const handleSubmit2 = () => {        
            scrollToend();
            ////console.log(Socket.id);
            inputRef.current.focus();
            showMsgStatus(false);
            Socket.emit("msg", { roomid: roomid, message: inp.value });
            inp.setValue("");
        
    }
    if (loading||loading1){
        return <SkeletonTheme color={color}>       
        {!mobile&&<ChatWrapper>
        <ChatHeader history={history} />
            <ChatListLoader color={color}/>
        </ChatWrapper>}
        <MessageRoom>
            <div className="roomHeader">
                <div className="backbtn"></div>
                <Skeleton circle={true} height={32} width={32} />
                <div className="infowrapper">
                <Skeleton className={"unames"} width={90}/>
                </div>
            </div>
            <div className="message" style={{overflowX:"hidden"}}>
                     
                    <div className="msgpiece" style={{ float:"right" ,cursor:"pointer" }}>
                            <div  style={{ paddingRight: "9px", paddingTop: "8px" }}>
                            <div className="self">
                                    <Skeleton className={"msgwrapperd"} width={130} height={50}/>
                                </div>                                
                            </div>
                        </div>
                        <div className="msgpiece" style={{ float:"right" ,cursor:"pointer" }}>
                            <div  style={{ paddingRight: "9px", paddingTop: "8px" }}>
                            <div className="self">
                                    <Skeleton className={"msgwrapperd"} width={160} height={50}/>
                                </div>                                
                            </div>
                        </div>
                        <div className="msgpiece" style={{ float:"left" ,cursor:"pointer" }}>
                            <div  style={{ paddingRight: "9px", paddingTop: "8px" }}>
                            <div className="self">
                                    <Skeleton className={"msgwrapperd"} width={100} height={50}/>
                                </div>                                
                            </div>
                        </div>
                        <div className="msgpiece" style={{ float:"left" ,cursor:"pointer" }}>
                            <div  style={{ paddingRight: "9px", paddingTop: "8px" }}>
                            <div className="self">
                                    <Skeleton className={"msgwrapperd"} width={140} height={50}/>
                                </div>                                
                            </div>
                        </div>
                        <div className="msgpiece" style={{ float:"right" ,cursor:"pointer" }}>
                            <div  style={{ paddingRight: "9px", paddingTop: "8px" }}>
                            <div className="self">
                                    <Skeleton className={"msgwrapperd"} width={180} height={50}/>
                                </div>                                
                            </div>
                        </div>
                        <div className="msgpiece" style={{ float:"right" ,cursor:"pointer" }}>
                            <div  style={{ paddingRight: "9px", paddingTop: "8px" }}>
                            <div className="self">
                                    <Skeleton className={"msgwrapperd"} width={100} height={50}/>
                                </div>                                
                            </div>
                        </div>
                        <div className="msgpiece" style={{ float:"left" ,cursor:"pointer" }}>
                            <div  style={{ paddingRight: "9px", paddingTop: "8px" }}>
                            <div className="self">
                                    <Skeleton className={"msgwrapperd"} width={130} height={50}/>
                                </div>                                
                            </div>
                        </div>
                        <div className="msgpiece" style={{ float:"left" ,cursor:"pointer" }}>
                            <div  style={{ paddingRight: "9px", paddingTop: "8px" }}>
                            <div className="self">
                                    <Skeleton className={"msgwrapperd"} width={125} height={50}/>
                                </div>                                
                            </div>
                        </div>
            </div>            
        </MessageRoom>
        </SkeletonTheme>
    }
    if (err)
        return <Placeholder text={err} title="unable to load page" />

    return (
        <>
        {!mobile&&users.length===0&&<ChatWrapper>
            <ChatHeader history={history}/>
            <Placeholder
                title="Start a new chat"
                text="Click write icon at the top right corner"
            />
            </ChatWrapper>}
        {!mobile&&users.length>0&&<ChatWrapper>
            <ChatHeader history={history}/>           
                {
                    
                        users.length > 0 && (
                            users.map((user) => {
                                return (
                                    <div className="chatcomponent" onClick={() => history.push(`${user.uri}`)} key={user.id} title={user.username} id={user.id}>
                                        <div className="chatavatar">
                                            <Avatar lg src={user?.avatar} onContextMenu={(e)=>e.preventDefault()}/>
                                        </div>
                                        <div className="nextinfo">
                                            <div className="username">{user.username}</div>
                                            <div className="lastmessage-parent">
                                                {user.newmsg&&chatRoomid!=user.id?<div className="lastmessage bold" id={user?.uri.split("/t/")[1]}>{user?.lastmessage}</div>:<div className="lastmessage" id={user?.uri.split("/t/")[1]}>{user?.lastmessage}</div>}
                                                <div className="since">{user.timeSince ? timeSince(user.timeSince,true) : ""}</div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }))}
                          

        </ChatWrapper>}
        <MessageRoom>
            {
                showmodel && (
                    <Modal>
                        <ModalContent
                            msgId={msgId}
                            roomid={roomid}
                            text={TXT}
                            isMine={mine}                           
                            Socket={Socket}
                            closeModal={closeModal}
                        />
                    </Modal>
                )

            }
            <div className="roomHeader">
                <div className="backbtn" onClick={() => history.push('/chat/inbox')}><BackIcon /></div>
                <Avatar src={user.avatar} style={{marginTop:"4px"}} onContextMenu={(e)=>e.preventDefault()}/>
                <div className="infowrapper" title={user.bio} onClick={()=>history.push(`/${user.username}`)}>
                <h3 className="uname" style={{ fontWeight: 'bold' }}>{user.username}</h3>
                <span className="fname">{user.fullname}</span>
                </div>
                <div className="additional">
                    <div className="icon" onClick={()=>handleCall(true)}><VideoIcon/></div>
                    <div className="icon" onClick={()=>handleCall(false)}><VoiceIcon/></div>
                </div>
            </div>
            <div className="message">
                {
                    Messages.map((msg) => {
                    if(msg.isMine)
                        return <div {...longPressEvent} onTouchStartCapture={()=>idsetter(msg._id,msg.isMine,msg.text)} onMouseDownCapture={()=>idsetter(msg._id,msg.isMine,msg.text)} id={msg._id} className="msgpiece" style={{ float: `${msg.isMine ? "right" : "left"}`,cursor:"pointer" }} key={msg._id}>
                            <div className="msgwrapper" style={{ paddingRight: "9px", paddingTop: "8px" }}>
                            <Linkify componentDecorator={componentDecorator}><div className="self">
                                    {msg.text}
                                </div></Linkify>
                                <div className="stamp" style={{ float: `${msg.isMine ? "right" : "left"}` }}>
                                    {timeSince(msg.createdAt, true)}
                                </div>
                            </div>
                        </div>
                    else
                    return <div  className="msgpiece" {...longPressEvent} onTouchStartCapture={()=>idsetter(msg._id,msg.isMine,msg.text)} onMouseDownCapture={()=>idsetter(msg._id,msg.isMine,msg.text)} id={msg._id} style={{ float: `${msg.isMine ? "right" : "left"}`,cursor:"pointer" }} key={msg._id}>
                            <div className="msgwrapper" style={{ paddingRight: "9px", paddingTop: "8px" }}>
                                <Linkify componentDecorator={componentDecorator}><div className="self">
                                    {msg.text}
                                </div></Linkify>
                                <div className="stamp" style={{ float: `${msg.isMine ? "right" : "left"}` }}>
                                    {timeSince(msg.createdAt, true)}
                                </div>
                            </div>
                        </div>
                    })
                }
                {msgstatus&&<div className="msgstatus msgpiece secondary">seen</div>}
                <div className="msgpiece" ref={endRef} key="unique"></div>
            </div>
            <div className="footerchat">
                <div id="inputwrapper">
                    <input
                        columns="2"
                        placeholder="Type a message"
                        value={inp.value}
                        ref={inputRef}
                        onChange={inp.onChange}
                        onKeyDown={handleSubmit}>
                    </input>
                </div>
                <div className="btn" onClick={handleSubmit2}><InboxIcon theme={theme2} /></div>
            </div>
        </MessageRoom>
        </>
    )
}
export default Mainchat;