import React, { useEffect, useRef, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import styled from "styled-components";
import useLongPress from "../posts/useLongPress";
import Avatar from "../../styles/Avatar";
import Loader from "../utility/Loader";
import { logout } from "../home/Home";
import Modal from "../posts/Modal";
import io from "socket.io-client";
import { connect, timeSince } from "../../utils/fetchdata";
import Placeholder from "../utility/Placeholder";
import { BackIcon,InboxIcon } from "../../Icons";
import Modify from "../../hooks/Modify";
import { toast } from "react-toastify";
import { ModalContentWrapper } from "../posts/PostComponents";
import {ChatWrapper,ChatHeader} from "./Homechat";

export const MessageRoom = styled.div`
   html,body{
       overflow-y:hidden !important;
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
       width:100%;
       display:flex;
       position:fixed;
       top:0px;
       background:${(props) => props.theme.bg} ;
        padding:15px;
        border-bottom:1px solid ${(props) => props.theme.borderColor} ;
       height:55px;
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
.self,.stamp{
    padding-left:10px;
    word-break:break-word;
}
.msgwrapper{
    background: ${(props) => props.theme.borderColor};
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
const ModalContent = ({ msgId, closeModal, roomid, msgdelete ,socket}) => {
    const Deletemsg = () => {
        closeModal();
        socket.emit('delete',{msgId,roomid});
    }
    return (
        <Modal>
            <ModalContentWrapper>
                <span className="danger" onClick={closeModal}>
                    Cancel
                 </span>
              <span className="danger" onClick={Deletemsg}>
                    Delete
            </span>
            </ModalContentWrapper>
        </Modal>
    )
}
const Mainchat = () => {
    const { roomid } = useParams();
    const [users, setUsers] = useState([]);    
    const [socket, setSocket] = useState(null);
    const [Messages, setMessages] = useState([]);
    const token = localStorage.getItem('accesstoken');
    const [mobile,setMobile] = useState(false);
    const endRef = useRef(null);
    const inputRef = useRef(null);
    const [msgId, setId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loading1, setLoading1] = useState(true);
    const theme = { fill: "#888" };
    const [err, setErr] = useState("");
    const inp = Modify("");
    const [showmodel, setShowModal] = useState(false);
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
        if (token && !socket) {
            const socket = io.connect("http://localhost:55000", {
                query: {
                    token: token
                }
            });
            if(socket.connected)
               return;
            socket.connect();
            socket.on("connect", () => {
                setSocket(socket);
                console.log(Messages);
                // toast.success("socket connected");

            })
            
            socket.on('errormsg',function(err){
                 toast.error(err);
            })
            
            socket.on('disconnect', () => {
                setSocket(null);
                toast.error('socket disconnected');                
                setTimeout(makeSocketConnection, 1000);
            })
        }
    };
    const onLongPress = () => {
        
        setShowModal(true);
    };

    const onClick = (e) => {
        
        console.log('click is triggered')
    }
    const idsetter = (id)=>{
        console.log(id);
        setId(id);
    }
    const closeModal = () => {
        setShowModal(false);
    }
    const defaultOptions = {
        shouldPreventDefault: true,
        delay: 700,
    };
    const msgdelete = (id) => {
        //console.log(commentId);
        console.log("reached deleted");
        const msgs = Messages.filter((msg) => { return msg._id !== id });
        //console.log(comments);      
        setMessages(msgs);
    }
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
            setUsers(chats.data);
            console.log(chats.data);
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
            console.log(detail.messages);
            setUser(detail.user);
            setLoading(false);
            scrollToend();
            makeSocketConnection();
        }).catch(err => {
            err.logout && logout();
            setErr(err.message);
            setLoading(false);
        })

    }, []);
    useEffect(()=>{
        socket&&socket.on("msg", function (data) {
            if(data.roomid==roomid){
            //Messages.push(data.data);
            console.log(data);
            const newmsg = [...Messages, data];
            setMessages(newmsg);
            if(endRef?.current)
                scrollToend()
            
            console.log("socketdata", Messages);
        }
        else{
            if(document.getElementById(data.roomid)){
                document.getElementById(data.roomid).textContent = data.text;
                document.getElementById(data.roomid).style.fontWeight="bold";
                document.getElementById(data.roomid).style.color = "green";
                document.getElementById(data.roomid).nextElementSibling.textContent = timeSince(data.createdAt,true)
                toast.success("\n"+data.sender+": "+data.text.substring(0,20)+"...");
            }
            else{
                console.log('requesting verification');
                socket.emit('requestverification',data.roomid);
            }
            
        }
        })
        socket&&socket.on('deletingmsg',function(id){
            document.getElementById(id.msgId)&&document.getElementById(id.msgId).remove();
        })
        return ()=>{
            if(socket){
            socket.off('deletingmsg');
            socket.off('msg');
            socket.off('errormsg');
            socket.off('disconnect');
            }
        }
        
    },[Messages,socket]);
    useEffect(()=>{
        socket&&socket.on('addnewlist',function(data){
            console.log('here');
            if(!document.getElementById(data.id))
            setUsers([data,...users]);
        });
    },[users,socket])
    const handleSubmit = (e) => {
        if (e.keyCode === 13) {
            scrollToend();
            //console.log(socket.id);
            socket.emit("msg", { roomid: roomid, message: inp.value });
            inp.setValue("");
        }
    }
    const handleSubmit2 = () => {        
            scrollToend();
            //console.log(socket.id);
            inputRef.current.focus();
            socket.emit("msg", { roomid: roomid, message: inp.value });
            inp.setValue("");
        
    }
    if (loading||loading1)
        return <Loader />
    if (err)
        return <Placeholder text={err} title="unable to load page" />

    return (
        <>
        {!mobile&&users.length==0&&<ChatWrapper>
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
                                    <div className="chatcomponent" onClick={() => history.push(`${user.uri}`)} key={user.id} title={user.username}>
                                        <div className="chatavatar">
                                            <Avatar lg src={user?.avatar} />
                                        </div>
                                        <div className="nextinfo">
                                            <div className="username">{user.username}</div>
                                            <div className="lastmessage-parent">
                                                <div className="lastmessage" id={user?.uri.split("/t/")[1]}>{user?.lastmessage}</div>
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
                            msgdelete={msgdelete}
                            socket={socket}
                            closeModal={closeModal}
                        />
                    </Modal>
                )

            }
            <div className="roomHeader">
                <div className="backbtn" onClick={() => history.push('/chat/inbox')}><BackIcon /></div>
                <Avatar src={user.avatar} />
                <h3 className="uname" style={{ fontWeight: 'bold' }}>{user.username}</h3>
            </div>
            <div className="message">
                {
                    Messages.map((msg) => {
                    if(msg.isMine)
                        return <div {...longPressEvent} onTouchStartCapture={()=>idsetter(msg._id)} onMouseDownCapture={()=>idsetter(msg._id)} id={msg._id} className="msgpiece" style={{ float: `${msg.isMine ? "right" : "left"}`,cursor:"pointer" }} key={msg._id}>
                            <div className="msgwrapper" style={{ paddingRight: "9px", paddingTop: "8px" }}>
                                <div className="self">
                                    {msg.text}
                                </div>
                                <div className="stamp" style={{ float: `${msg.isMine ? "right" : "left"}` }}>
                                    {timeSince(msg.createdAt, true)}
                                </div>
                            </div>
                        </div>
                    else
                    return <div  className="msgpiece" id={msg._id} style={{ float: `${msg.isMine ? "right" : "left"}` }} key={msg._id}>
                            <div className="msgwrapper" style={{ paddingRight: "9px", paddingTop: "8px" }}>
                                <div className="self">
                                    {msg.text}
                                </div>
                                <div className="stamp" style={{ float: `${msg.isMine ? "right" : "left"}` }}>
                                    {timeSince(msg.createdAt, true)}
                                </div>
                            </div>
                        </div>
                    })
                }
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
                <div className="btn" onClick={handleSubmit2}><InboxIcon theme={theme} /></div>
            </div>
        </MessageRoom>
        </>
    )
}
export default Mainchat;