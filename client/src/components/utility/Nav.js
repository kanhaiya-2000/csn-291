import React, { useContext} from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { ThemeContext } from "../../context/ThemeContext";
import Search from "./Search";
import { UserContext } from "../../context/UserContext";
import navlogo from "../../assets/navlogo.png";
import { HomeIcon, HighlightIcon, BellIcon ,NewPostIcon, InboxIcon} from "../../Icons";


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
  svg{
    fill:${(props)=>props.theme.primaryColor}
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
      height:40px;
      margin-bottom:-2px;
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
  const {theme} = useContext(ThemeContext);
  
  return (
    <NavWrapper>
      <nav>
        <Link to="/">
          <img className="nav-logo" src={navlogo} alt="logo" />
        </Link>
        <Search />
        
        <li style={{position:"fixed",top:"10px",right:"10px"}} className="mobile-direct">
            <Link to="/chat/inbox" >
              <InboxIcon theme={theme}/>
            </Link>
          </li>        
      
        <ul className="navlink" style={{display:"flex",alignItems:"center"}}>
          <li>
            <Link to="/" >
              <HomeIcon activeclassname="active" theme={theme}/>
            </Link>
          </li>
          <li>
            <Link to="/chat/inbox" >
              <InboxIcon theme={theme}/>
            </Link>
          </li>
          <li>
          <Link to="/accounts/new" >
            <NewPostIcon activeclassname="active" theme={theme}/>
          </Link>
          </li>
          <li>
            <Link to="/highlight">
              <HighlightIcon activeclassname="active" theme={theme}/>
            </Link>
          </li>          
          <li>
          <Link to="/accounts/notifications">
            <BellIcon activeclassname="active" theme={theme}/>
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
      <ul className="mobnavlink" style={{display:"flex",alignItems:"center",justifyContent:"space-around"}}>
          <li>
            <Link to="/" >
              <HomeIcon activeclassname="active" theme={theme}/>
            </Link>
          </li>
          <li>
          <Link to="/accounts/new" >
            <NewPostIcon activeclassname="active" theme={theme}/>
          </Link>
          </li>
          <li>
            <Link to="/highlight">
              <HighlightIcon activeclassname="active" theme={theme}/>
            </Link>
          </li>          
          <li>
          <Link to="/accounts/notifications">
            <BellIcon activeclassname="active" theme={theme}/>
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