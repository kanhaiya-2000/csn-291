import { connect } from "../../utils/fetchdata";
import React ,{useState} from "react";
import { useHistory} from "react-router-dom";
import styled from "styled-components";
import Avatar from "../../styles/Avatar";
//import Loader from "../utility/Loader";
import { logout } from "../home/Home";
import {BackIcon} from "../../Icons";
import Placeholder from "../utility/Placeholder";
import Modify from "../../hooks/Modify";
import { toast } from "react-toastify";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { ThemeContext } from "../../context/ThemeContext";

const LoaderComponent = ()=>{
    return <div style={{cursor:"pointer"}}
    className="userComponent">
      <div className="avatar"><Skeleton circle={true} width={50} height={50}/></div><div className="userinfo"><div className="username"><Skeleton width={100}/></div> <div className="fullname"><Skeleton width={130}/></div>
      </div>
  </div> 
}
const NewChatPage = styled.div`
.chatheader{
    top:0px;
    
    position:fixed;
    display:flex;
    width:100%;
    background:${(props) => props.theme.bg} ;
    padding:15px;
    border-bottom:1px solid ${(props) => props.theme.borderColor} ;
}
.results{
    width:100%;
    padding-top:20px;
}
svg{
    fill:${(props) => props.theme.primaryColor}
}
svg[aria-label="Back"]{
    transform:rotate(-90deg);
    margin-right:15px;
}
.avatar{
    height:60px;
    width:60px;
}
.userComponent{
    width:100%;
    padding:10px;
    display:flex;
    flex-wrap:nowrap;
    height:60px;
    margin-bottom:10px;
}
.username{
    color:${(props) => props.theme.primaryColor};
    font-weight:bold;
}
@media screen and (min-width:700px){
    .inputdiv{
        top:77px !important;
        max-width:930px !important;
    }
    .results{        
        padding-top:25px !important;
    }
}
@media screen and (max-width:800px) and (min-width:700px){
    .results{
        padding-top:55px !important;
    }
}
.banner{
    font-weight:bold;
    margin:auto;
}
.results{
    padding-top:55px;
}
.input{
    width:100%;
    padding-left:15px;
    border:0;
    background-color: transparent;
    color:${(props) => props.theme.primaryColor};
    outline:none;
}
.inputdiv{
    border-bottom:1px solid ${(props) => props.theme.borderColor} ;
    padding:10px;
    position:fixed;
    top:63px;
    width:100%;
    background:${(props) => props.theme.bg} ;
}
.fullname{
    ${(props) => props.theme.secondaryColor}
}
.userinfo{
    padding-left:20px;
    display:flex;
    width:calc(100% - 60px);
    flex-direction:column;
}
`;
const NewChat = () => {    
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const {theme} = React.useContext(ThemeContext);
    const inp = Modify("");
    const history = useHistory();
    React.useEffect(() => {
        if (window.innerWidth < 700) {
            document.getElementsByTagName('nav')[0].style.display = "none";
            document.getElementsByClassName('mobile')[0].style.display = "none";
        }
        connect('/chat/getuser').then((data) => {
            setUsers(data.data);
            setLoading(false);
        }).catch(err => {
            setErr(err.message);
            err.logout && logout();
        })
    },[setUsers,setLoading,setErr])
    const createRoom = (id)=>{        
        connect('/chat/new/'+id,{method:"POST"}).then((data)=>{
            history.push(data.uri);
        }).catch(err=>{
            toast.error(err.message);
        })
    }
    const filterUser = ()=>{       
        let input = document.getElementById('enter');
        connect('/chat/getuser/'+input.value.toLowerCase()).then(data=>{
        setUsers(data.data);
    }).catch(err=>{
        err.logout&&logout();
    })
    }
    if (loading)
        return <SkeletonTheme color={theme.skeleton}><NewChatPage>
        <div className="chatheader">
                <div className="backbtn" onClick={() => history.push('/chat/Inbox')}><BackIcon /></div>
                <h3 className="banner">New Messages</h3>
            </div>
            <div className="inputdiv">
                <input id="enter" type="text" placeholder="Search user" className="input"/>
            </div>
        <div className="results">
                <LoaderComponent/>
                <LoaderComponent/>
                <LoaderComponent/>
                <LoaderComponent/>
                <LoaderComponent/>
                <LoaderComponent/>
                <LoaderComponent/>
                <LoaderComponent/>
                <LoaderComponent/>
                <LoaderComponent/>
                <LoaderComponent/>
                <LoaderComponent/>
                <LoaderComponent/>
                <LoaderComponent/>                        
                </div>
    </NewChatPage>
    </SkeletonTheme>
    if (err)
        return <Placeholder text={err} title="unable to load page" />
    if(users.length===0)
       return <NewChatPage>
           <div className="chatheader">
                <div className="backbtn" onClick={() => history.push('/chat/Inbox')}><BackIcon /></div>
                <h3 className="banner">New Messages</h3>
            </div>
            <div className="inputdiv">
                <input id="enter" value={inp.value} onChange={(e)=>{inp.onChange(e);filterUser()}} type="text" placeholder="Search user" className="input"/>
            </div>
            <Placeholder text="Currently there is no user" title="No user found" paddingTop="100px"/>
       </NewChatPage>

    return (
        <NewChatPage>
            <div className="chatheader">
                <div className="backbtn" onClick={() => history.push('/chat/Inbox')}><BackIcon /></div>
                <h3 className="banner">New Messages</h3>
            </div>
            <div className="inputdiv">
                <input id="enter" value={inp.value} onChange={(e)=>{inp.onChange(e);filterUser()}} type="text" placeholder="Search user" className="input"/>
            </div>
            <div className="results">
                {
                    users.map((user) => {
                        return (
                            <div key= {user._id} style={{cursor:"pointer"}}
                             title={"start a new chat with "+user.fullname} className="userComponent" onClick={()=>createRoom(user._id)}>
                                <div className="avatar"><Avatar src={user.avatar} onContextMenu={(e)=>e.preventDefault()} lg/></div><div className="userinfo"><div className="username">{user.username}</div> <div className="fullname">{user.fullname}</div>
                                </div>
                            </div>
                        )
                    })
                }

            </div>

        </NewChatPage>
    )

}
export default NewChat;
