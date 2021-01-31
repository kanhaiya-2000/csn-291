import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
//import { NoticeContext } from "../../context/NoticeContext";
import { connect } from "../../utils/fetchdata";
//import Loader from "../utility/Loader";
//import Modal from "../posts/Modal";
import NoticeComponents from './NoticeComponents';
import { logout } from "../home/Home";
import Follow from "../utility/Follow";
import Avatar from "../../styles/Avatar";
import { SkeletonTheme } from "react-loading-skeleton";
import { ThemeContext } from "../../context/ThemeContext";
import { SocketContext } from "../../context/SocketContext";

const NoticeModal = styled.div`
width:60%;
margin:auto;
margin-top:3.5rem !important;
display:flex;
flex-wrap:wrap;
flex-direction:column;
padding:10px 8px;

.notice,.suggestions{
    width:100%;    
    background:${(props) => props.theme.white};
    margin:15px 2px;
    padding-left:5px;
    margin-top:-42px;
}
.suggestions{
    margin-top:15px;
}
.suggestion-component,.suggestion-body,.suggestions-usercard{
    width:100%;
    padding:2px;
}
.suggestions-usercard{
    display:flex;
    flex-wrap:nowrap;
}
.userdetail{
    display:flex;
    width:80%;
    cursor:pointer;
    flex-wrap:nowrap;
    
}
.h3{
    border-bottom:1px solid ${(props) => props.theme.borderColor};
    padding:20px 10px;
}
.followrapper *{
    margin:auto;
    margin-right:16px;
}
@media screen and (max-width: 690px) {
    width: 100%;
    padding:10px 0px;
  }


`;
const Notification = () => {
    const [Notice, setNotice] = useState([]);
    const [Suggestions, setSuggestions] = useState([]);
    const { Socket, setSocket } = useContext(SocketContext);
    const [loading, setLoading] = useState(true);
    const { theme } = useContext(ThemeContext);
    const token = localStorage.getItem('accesstoken');
    const history = useHistory();
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
                toast.error('Socket disconnected');
                setTimeout(makeSocketConnection, 1000);
            })
        }
    };
    useEffect(() => {
        makeSocketConnection();
        connect('/user/notice', { method: "POST" }).then((res) => {
            setNotice(res.notices);
            //console.log(res.notices);            
            if (Socket && res.unseennotice>0) {
                Socket.emit('noticeseen', res.notices[0]._id);
                document.getElementById('noti-wrapper-mobile').style.display = 'none';
                document.getElementById('noti-wrapper').style.display = 'none';
            }
            setLoading(false);
        }).catch(err => {
            err.logout && logout();
            toast.error(err.message);
        })
        connect("/user").then((response) => {
            setSuggestions(response.data.filter((user) => !user.isFollowing));
        });
    }, [setNotice, setLoading, setSuggestions]);
    if (loading) {
        return <SkeletonTheme color={theme.skeleton}> <NoticeModal>
            <>
                <div className="notice">
                    <NoticeComponents key={0} />
                    <NoticeComponents key={1} />
                    <NoticeComponents key={2} />
                    <NoticeComponents key={3} />
                    <NoticeComponents key={4} />
                    <NoticeComponents key={5} />
                    <NoticeComponents key={6} />
                    <NoticeComponents key={7} />

                </div>

            </>
        </NoticeModal>
        </SkeletonTheme>
    }

    return (
        <NoticeModal>

            {Notice.length > 0 ? (
                <>
                    <div className="notice">
                        <h3 className="h3" style={{ padding: "20px 10px" }}>Notifications</h3>
                        {Notice.map((notice) => (
                            <NoticeComponents key={notice._id} notice={notice} />
                        ))}
                    </div>
                    <div className="suggestions"> {
                        Suggestions.length > 0 ? (
                            <div className="suggestion-component">
                                <h3 className="h3" style={{ paddingBottom: "20px 10px" }}>Suggestions for You</h3>
                                {
                                    Suggestions.map((user) => (
                                        <div key={user._id} className="suggestion-body">
                                            <div key={user.username} className="suggestions-usercard">
                                                <div className="userdetail" onClick={() => history.push(`/${user.username}`)} >
                                                    <Avatar
                                                        style={{ alignSelf: "center" }}
                                                        src={user.avatar}
                                                        alt="avatar"
                                                    />
                                                    <div className="user-info" style={{ display: "flex", flexWrap: "wrap", flexDirection: "column", justifyContent: "start" }}>
                                                        <h3 style={{ width: "100%" }}>{user.username}</h3>
                                                        <span style={{ width: "100%", color: "gray" }}>{user.fullname}</span>
                                                    </div>
                                                </div>
                                                <div style={{ width: "calc(100% - 100px)", display: "flex" }} className="followrapper">
                                                    <Follow isFollowing={user.isFollowing} userId={user._id} />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>) :
                            <h3 style={{ padding: "20px 10px" }}>Right now ,there is no suggestions for you.</h3>
                    }
                    </div>
                </>
            ) : (
                    <div className="suggestions"> {
                        Suggestions.length > 0 ? (
                            <div className="suggestion-component">
                                <h3 className="h3" style={{ borderBottom: "1px solid white", paddingBottom: "20px 10px" }}>Suggestions for You</h3>
                                {
                                    Suggestions.map((user) => (
                                        <div key={user._id} className="suggestion-body">
                                            <div key={user.username} className="suggestions-usercard">
                                                <div className="userdetail" onClick={() => history.push(`/${user.username}`)} >
                                                    <Avatar
                                                        style={{ alignSelf: "center" }}
                                                        src={user.avatar}
                                                        alt="avatar"
                                                    />
                                                    <div className="user-info" style={{ display: "flex", flexWrap: "wrap", flexDirection: "column", justifyContent: "start" }}>
                                                        <h3 style={{ width: "100%" }}>{user.username}</h3>
                                                        <span style={{ width: "100%", color: "gray" }}>{user.fullname}</span>
                                                    </div>
                                                </div>
                                                <div style={{ width: "calc(100% - 100px)", display: "flex" }} className="followrapper">
                                                    <Follow isFollowing={user.isFollowing} userId={user._id} />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>) :
                            <h3 style={{ padding: "20px 10px" }}>Right now ,there is no suggestions for you.</h3>
                    }
                    </div>
                )}
        </NoticeModal>
    );
}


export default Notification;