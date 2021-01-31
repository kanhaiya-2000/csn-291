import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {ThemeContext} from "../../context/ThemeContext";
import styled from "styled-components";
import {useHistory } from "react-router-dom";
import Follow from "../utility/Follow";
import Modal from "../posts/Modal";
import Button from "../../styles/Button";
import { UserContext } from "../../context/UserContext";
import { OptionsIcon,CloseIcon, MsgIcon } from "../../Icons";
import { connect } from "../../utils/fetchdata";
import Modify from "../../hooks/Modify";


export const MobileWrapper = styled.div`
  margin: 1rem 0;
  font-size: 1rem;
  padding-left: 1rem;
  .mobile-profile-stats span {
    padding-right: 1rem;
  }
  .header-modal{
    z-index:5;
    background:${(props) => props.theme.bg};
  }
  .mobile-bio,
  .mobile-profile-stats {
    display: none;
  }
  button{
    color:${(props)=>props.theme.primaryColor} !important;
  }
  @media screen and (max-width: 645px) {
    .mobile-bio {
      display: block;
    }
    .mobile-profile-stats {
      display: block;
      margin-bottom: 0.4rem;
    }
  }
  a {
    color: ${(props) => props.theme.blue};
  }
`;

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  .btn{  
      cursor:pointer;
      padding: 0.4rem 1rem;
      color: #fff;
      border-radius: 4px;
      margin-top: 1rem;
      margin-left: 1rem;
      font-size: 1rem;
      background:${(props) => props.theme.bg} !important;
    
  }
  .avatar {
    width: 180px;
    height: 180px;
    object-fit: cover;
    border-radius: 90px;
    margin-right: 2rem;
  }
  .header-modal{
    z-index:5;
    background:${(props) => props.theme.bg};
  }
  .profile-meta {
    display: flex;
    align-items: baseline;
    margin-bottom: 1rem;
  }
  .profile-meta h2 {
    position: relative;
    top: 3px;
  }
  .profile-stats {
    display: flex;
    margin-bottom: 1rem;
  }
  .options svg {
    position: relative;
    top: 7px;
    margin-left: 1rem;
  }
  span {
    padding-right: 1rem;
  }
  a {
    color: ${(props) => props.theme.blue};
  }
  button{
    color: ${(props)=>props.theme.primaryColor};
  }
  @media screen and (max-width: 645px) {
    font-size: 1rem;
    .bio,
    .profile-stats {
      display: none;
    }
    .avatar {
      width: 140px;
      height: 140px;
    }
    .profile-meta {
      flex-direction: column;
    }
    button {
      margin-left: 0;
    }
    .bio-mobile {
      margin: 1rem 0;
      display: block;
    }
  }
  svg{
    fill: ${(props) => props.theme.primaryColor} !important;
  }
  @media screen and (max-width: 420px) {
    font-size: 0.9rem;
    .avatar {
      width: 100px;
      height: 100px;
      margin-left:16px;
    }
  }
`;

export const modalHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "1px solid #DBDBDB",
  padding: "1rem",
  minWidth:"300px",
  position:"sticky",
  top:"0px",
  background:`${(props) => props.theme.bg}`  
};
const OptionContentWrapper = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  text-align: center;
  span:last-child {
    border: none;
  }
  .danger{
    color:red;
  }
  .normal{
    color: ${(props) => props.theme.primaryColor}
  }
  span {
    display: block;
    padding: 1rem 0;
    border-bottom: 1px solid ${(props) => props.theme.borderColor};
    cursor: pointer;
  }
`;
const PasswordContentWrap = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  text-align: center; 
  button {
    margin-top: 1.5rem;
    margin-left: 0px;
    margin-bottom: 1rem;
  } 
  input {
    padding: 8px;
    font-family: "Fira Sans", sans-serif;
    background: ${(props) => props.theme.inputBg};
    color: ${(props) => props.theme.primaryColor};
    font-size: 1rem;
    border-radius: 4px;
    border: 1px solid ${(props) => props.theme.borderColor};
    width: 100%;
  }
  .content{
    width:100%;
    display:flex;    
    flex-wrap:nowrap;
    padding:5px 7px;    
  }
  @media screen and (max-width:400px){
    width:calc(100% - 20px);
  }
  
`;
export const ModalContentWrapper = styled.div` 
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  padding-right: 2rem;
  font-size: 0.9rem;
  width: 350px;
  img {
    width: 40px;
    object-fit: cover;
    height: 40px;
    border-radius: 20px;
    margin-right: 1rem;
  }
  .profile-info {
    display: flex;
  }
  span {
    color: ${(props) => props.theme.secondaryColor};
  }
  button {
    font-size: 0.9rem;
    position: relative;
    top: -10px;
    color: ${(props) => props.theme.primaryColor} !important;
  }
  @media screen and (max-width: 480px) {
    width: 340px;
  }
`;

const ModalContent = ({ loggedInUser, users, closeModal, title }) => {
  const history = useHistory();
  const {theme} = useContext(ThemeContext);
  return (
    <div style={{ maxHeight: "400px", overflowY: "auto",overflowX:"hidden" }}>
      <div style={modalHeaderStyle} className="header-modal">
        <h3>{title}</h3>
        <CloseIcon onClick={closeModal} theme={theme} />
      </div>
      {users.map((user) => (
        <ModalContentWrapper key={user._id}>
          <div className="profile-info">
            <img
              className="pointer"
              onContextMenu={(e)=>e.preventDefault()}
              onClick={() => {
                closeModal();
                history.push(`/${user.username}`);
              }}
              src={user.avatar}
              alt="avatar"
            />
            <div className="user-info">
              <h3
                className="pointer"
                onClick={() => {
                  closeModal();
                  history.push(`/${user.username}`);
                }}
              >
                {user.username}
              </h3>
              <span>{user.fullname}</span>
            </div>
          </div>
          <Follow isFollowing={user.isFollowing} userId={user._id} myId={loggedInUser._id} />
        </ModalContentWrapper>
      ))}
    </div>
  );
};

const ProfileHeader = ({ profile }) => {
  const history = useHistory();
  const { user, setUser } = useContext(UserContext);
  const {theme} = useContext(ThemeContext);
  const [showFollowersModal, setFollowersModal] = useState(false);
  const OTP = Modify("");
  const password = Modify("");
  const [passwordmodal,setPasswordModel] = useState(false);
  const [option,setOptionModel] = useState(false);
  const [showFollowingModal, setFollowingModal] = useState(false);
  const closeModal = () => {
    setFollowersModal(false);
    setFollowingModal(false);
    setOptionModel(false);
  };
  const showOption = ()=>{
    setOptionModel(true);
  }
  const [followersState, setFollowers] = useState(0);
  const incFollowers = () => setFollowers(followersState + 1);
  const decFollowers = () => setFollowers(followersState - 1);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('userdetail');
    localStorage.removeItem('accesstoken');
    toast.success("You have been logged out");
  };
 const SwitchTheme = ()=>{
   if(localStorage.getItem('themepreference')){
     localStorage.removeItem('themepreference')
   }
   else{
     localStorage.setItem('themepreference','light');
   }
   window.location.reload();
 }
 const handleChangePassWord = ()=>{
   const body = {
     otp:parseInt(OTP.value),
     password:password.value
   }
   connect('/user/changepassword',{body}).then((data)=>{
     setPasswordModel(false);
     localStorage.setItem("accesstoken",data.token);
     toast.success("Password changed successfully");
   }).catch((err)=>{
     toast.error(err.message);
   })
 }
 const changePassword = ()=>{
    setOptionModel(false);
    
    connect('/user/requestpasswordotp',{method:"POST"}).then(()=>{
      setPasswordModel(true);
      toast.success("Check your registered email for the OTP")
    }).catch(err=>{
      toast.error("error in connecting to server.Kindly check your internet connection");
    })
 }
 const changeOTPvalue = (e)=>{
   OTP.setValue(e.target.value);
   e.target.focus();
 }
 const createRoom = (id)=>{        
  connect('/chat/new/'+id,{method:"POST"}).then((data)=>{
      history.push(data.uri);
  }).catch(err=>{
      toast.error(err.message);
  })
}
 const changePasswordvalue = (e)=>{
   password.setValue(e.target.value);
   e.target.focus();
 }
 const PasswordContent = ({handleChangePassWord})=>{
   return(
      <PasswordContentWrap>
        <div className="content">
          <input
          id="input1"
          type="password"
          value={password.value}
          onInput={()=>setTimeout(function(){document.getElementById('input1').focus()},100)}
          onChange={changePasswordvalue}
          placeholder="Enter your new password"
          />
        </div>
        <div className="content">
        <input
          type="number"
          id="input2"
          value={OTP.value}
          onInput={()=>setTimeout(function(){document.getElementById('input2').focus()},100)}
          onChange={changeOTPvalue}
          placeholder="Enter OTP"
          />
        </div>
        <div className="content">
          <Button onClick={handleChangePassWord}>Submit</Button>
        </div>
     </PasswordContentWrap>
   )
 }
  const OptionalContent = ({closeModal,SwitchTheme,changePassword,handleLogout}) => {
    
    return (
      <OptionContentWrapper>
        <span className="danger" onClick={closeModal}>
          Cancel
        </span>        
        <span className="normal" onClick={SwitchTheme}>
        switch theme
      </span>
      <span className="normal" onClick={changePassword}>
        change Password</span>
        <span className="danger" onClick={handleLogout}>
          log out</span>        
      </OptionContentWrapper>
    );
  };
  useEffect(() => setFollowers(profile?.followerCount), [profile]);

  return (
    <>
      <Wrapper>
        <img className="avatar" src={profile?.avatar} alt="avatar" onContextMenu={(e)=>e.preventDefault()}/>
        <div className="profile-info">
          <div className="profile-meta">
            <h2>{profile?.username}</h2>
            {profile?.isMe ? (
              <div className="options">
                <Button
                  secondary                  
                  onClick={() => history.push("/accounts/edit")}
                  
                >
                  Edit Profile
                </Button>
                <OptionsIcon fill={theme.primaryColor} onClick={showOption}/>
              </div>
            ) : (
              <div style={{width:"140px",display:"flex",justifyContent:"space-between",height:"50px"}}>
              <Follow
                isFollowing={profile?.isFollowing}
                incFollowers={incFollowers}
                decFollowers={decFollowers}
                userId={profile?._id}
                myId={user._id}
              />
              <span className="btn" style={{border: "1px solid #dbdbdb"}} 
              onClick={()=>createRoom(profile._id)}><MsgIcon/></span>
              </div>
            )}
          </div>

          <div className="profile-stats">
            <span>{profile?.postCount} posts</span>

            <span className="pointer" onClick={() => setFollowersModal(true)}>
              {followersState} followers
            </span>

            <span className="pointer" onClick={() => setFollowingModal(true)}>
              {profile?.followingCount} following
            </span>

            {showFollowersModal && profile?.followers.length > 0 && (
              <Modal>
                <ModalContent
                  loggedInUser={user}
                  users={profile?.followers}
                  title="Followers"
                  closeModal={closeModal}
                />
              </Modal>
            )}
            {
              option&&(
                <Modal>
                  <OptionalContent
                  closeModal={closeModal}
                  SwitchTheme={SwitchTheme}
                  changePassword={changePassword}
                  handleLogout={handleLogout}
                  />
                  </Modal>
              )
            }
            {
              passwordmodal&&(
                <Modal>
                  <PasswordContent handleChangePassWord={handleChangePassWord}/>
                </Modal>
              )
            }
            {showFollowingModal && profile?.following.length > 0 && (
              <Modal>
                <ModalContent
                  loggedInUser={user}
                  users={profile?.following}
                  title="Following"
                  closeModal={closeModal}
                />
              </Modal>
            )}
          </div>

          <div className="bio">
            <span className="bold">{profile?.fullname}</span>
            <p>{profile?.bio}</p>
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              {profile?.website}
            </a>
          </div>
        </div>
      </Wrapper>
      <MobileWrapper>
        <div className="mobile-profile-stats">
          <span>{profile?.postCount} posts</span>

          <span className="pointer" onClick={() => setFollowersModal(true)}>
            {followersState} followers
          </span>

          <span className="pointer" onClick={() => setFollowingModal(true)}>
            {profile?.followingCount} following
          </span>

          {showFollowersModal && profile?.followers.length > 0 && (
            <Modal>
              <ModalContent
                loggedInUser={user}
                users={profile?.followers}
                title="Followers"
                closeModal={closeModal}
              />
            </Modal>
          )}

          {showFollowingModal && profile?.following.length > 0 && (
            <Modal>
              <ModalContent
                loggedInUser={user}
                users={profile?.following}
                title="Following"
                closeModal={closeModal}
              />
            </Modal>
          )}
          {option&&(
                <Modal>
                  <OptionalContent
                  closeModal={closeModal}
                  SwitchTheme={SwitchTheme}
                  changePassword={changePassword}
                  handleLogout={handleLogout}
                  />
                  </Modal>
              )
            }
            {
              passwordmodal&&(
                <Modal>
                  <PasswordContent handleChangePassWord={handleChangePassWord}/>
                </Modal>
              )
            }
        </div>
        <div className="mobile-bio">
          <span className="bold">{profile?.fullname}</span>
          <p>{profile?.bio}</p>
          <a href={profile.website} target="_blank" rel="noopener noreferrer">
            {profile?.website}
          </a>
        </div>
      </MobileWrapper>
    </>
  );
};

export default ProfileHeader;
