import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import Avatar from "../../styles/Avatar";
import Loader from "../utility/Loader";
import { logout } from "../home/Home";
import { connect, timeSince } from "../../utils/fetchdata";
import Placeholder from "../utility/Placeholder";
import { BackIcon, NewmsgIcon } from "../../Icons";
import io from "socket.io-client";
import { MessageRoom } from "./Mainchat";



export const ChatWrapper = styled.div`
display:flex;
overflow-x:hidden !important;
width:400px;
margin-top:2px;
float:left;
overflow-y:scroll;
flex-wrap:nowrap;
height:78vh;
padding-top:30px;
flex-direction:column;
@media screen and (max-width:800px) and (min-width:700px){
    padding-top:70px;
    width:70px !important;
    left:0 !important;
    .banner,.nextinfo,.backbtn{
        display:none;
    }
    .chatheader{
        width:90px !important;
    }
    .chatcomponent{
        margin-bottom:10px !important;
    }
    .newmsg{
        left:40px !important;
        position:absolute !important;
    }
}
@media screen and (min-width:700px){
    position:fixed;
    left:20px;
}
.chatcomponent{
    width:100%;
    cursor:pointer;        
    display:flex;
    margin-top:10px;
    margin-bottom:30px;
    flex-wrap:nowrap;
    
    height:55px;
}

.chatavatar{
    align-self:center;
    text-align:justify;
    width:35px;
    margin-left:10px;
}
.nextinfo{
    width:calc(100 % - 50px);
    overflow:hidden;
    
    justify-content:center; 
    margin-left:20px;
    text-overflow:ellipsis;
    display:flex;
    flex-direction:column;
    padding-left:13px;
}
.chatheader{    
    top:77px;
    display:flex;
    justify-content:space-between;
    flex-wrap:nowrap;
    position:fixed;
    z-index:20;
    width:400px;    
    margin-left:-15px;
    height:55px;
    background:${(props) => props.theme.bg} ;
    padding:15px;
    border-bottom:1px solid ${(props) => props.theme.borderColor} ;
}
.lastmessage{
    color:${(props) => props.theme.secondaryColor}; 
    font-weight:thinner;
   
    word-break:no-break;
    overflow:hidden;
    white-space:nowrap;
    max-width:80%;
    text-overflow:ellipsis;
}
.lastmessage-parent{
    width:100%;
    display:flex;
    flex-direction:row;
}
.since{
    color:#685F5F;
    padding-left:5px;
}
.username{
    width:100%;
    font-weight:bold;
    color:${(props) => props.theme.primaryColor} ;
}
svg{
    fill:${(props) => props.theme.primaryColor}
}
svg[aria-label="Chat"]{
    transform:scale(2);
}

svg[aria-label="Back"]{
    transform:rotate(-90deg);
}
@media screen and (max-width:700px){
    width:100%;
    height:100%;
    margin-left:0;
    padding-top:0;
    .mobile,nav{
        display:none !important;
    }
   .chatcomponent{
       margin-bottom:20px;
   }

    .chatheader{        
        top:0px;
        left:0;
        position:fixed;
        width:100%;
        margin:0;        
        padding:15px;        
    }
}


`;

export const ChatHeader = ({history})=>{
    return <div className="chatheader">
    <div className="backbtn" onClick={() => history.push('/')}><BackIcon /></div>
    <h3 className="banner">Messages</h3>
    <div className="newmsg" onClick={() => history.push('/chat/new')}><NewmsgIcon/></div>
</div>
}
const Homechat = () => {
    const [users, setUsers] = useState([]);
    const [err, showErr] = useState("");
    const [mobile,setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [chatSocket,setSocket] = useState(null);
    const token = localStorage.getItem('accesstoken');
    const history = useHistory();
    const makeSocketConnection = () => {
        if (token && !chatSocket) {
            const socket = io.connect("http://localhost:55000", {
                query: {
                    token: token
                }
            });
            socket.on("connect", () => {
                setSocket(socket);
                //console.log(Messages);
                // toast.success("socket connected");

            })
            socket.on('disconnect', () => {
                setSocket(null);
                setTimeout(makeSocketConnection, 3000);
            })
        }
    };
    useEffect(() => {
        if (window.innerWidth < 700) {
            setIsMobile(true);
            document.getElementsByTagName('nav')[0].style.display = "none";
            document.getElementsByClassName('mobile')[0].style.display = "none";
        }
        makeSocketConnection();        
        connect('/user/chat', { method: "POST" }).then((chats) => {
            setUsers(chats.data);
            console.log(chats.data);
            setLoading(false);
        }).catch(err => {
            err.logout && logout();
            setLoading(false);
            showErr(err.message);
        })
        return () => {
            if (!window.location.toString().includes('chat'))
                window.location.reload();
                if(chatSocket){
                chatSocket.off('deletingmsg');
                chatSocket.off('connect');
                chatSocket.off('disconnect');
                chatSocket.off('msg');
                }
                //chatSocket&&chatSocket.disconnect();
        }
    }, [setLoading, showErr]);
    useEffect(()=>{        
        chatSocket&&chatSocket.on('msg',function(data){
            if(document.getElementById(data.roomid)){
                document.getElementById(data.roomid).textContent = data.text;
                document.getElementById(data.roomid).style.fontWeight="bold";
                document.getElementById(data.roomid).style.color = "green";
                document.getElementById(data.roomid).nextElementSibling.textContent = timeSince(data.createdAt,true);
            }
            else{
                console.log('requesting verification')
                chatSocket.emit('requestverification',data.roomid);
            }
            
            //console.log(data);
        });
        
        chatSocket&&chatSocket.on('deletingmsg',function(data){
            console.log("del ",data)
        })
    },[chatSocket])
    useEffect(()=>{
        chatSocket&&chatSocket.on('addnewlist',function(data){
            console.log('here');
            if(!document.getElementById(data.id))
            setUsers([data,...users]);
        });
    },[users,chatSocket])
    if (loading) {
        return <Loader />;
    }
    if (err) {
        return <Placeholder
            title="Unable to load page"
            text={err}
        />
    }
    if(users.length==0){
        return(
            <>
            <ChatWrapper>
            <ChatHeader history={history}/>
            <Placeholder
                title="Start a new chat"
                text="Click icon at the top right corner to start a chat"
            />
            </ChatWrapper>
            {!mobile&&<MessageRoom>
                <div className="intro" onClick={()=>history.push('/chat/new')}>
                <NewmsgIcon style={{transform:"scale(2)"}} />                
                        <div className="text">Start a new Conversation</div>
                    </div>
                </MessageRoom>}
                </>
        )
    }
    return( <>
        <ChatWrapper>
            <ChatHeader history={history}/>           
                {
                    
                        users.length > 0 && (
                            users.map((user) => {
                                return (
                                    <div className="chatcomponent" onClick={() => history.push(`${user.uri}`)} key={user.id}>
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
                          

        </ChatWrapper>
        {!mobile&&<MessageRoom>
            <div className="intro" onClick={()=>history.push('/chat/new')}>
            <NewmsgIcon style={{transform:"scale(2)"}} />                
                    <div className="text">Start a new Conversation</div>
                </div>
            </MessageRoom>}
        </>
    )

}
export default Homechat;