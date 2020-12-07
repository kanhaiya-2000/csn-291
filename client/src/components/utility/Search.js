import React, { useEffect, useRef, useState } from "react";
//import { toast } from "react-toastify";
import styled from "styled-components";
import { connect } from "../../utils/fetchdata"; ///LEFT PART
import Modify from "../../hooks/Modify";
import { logout } from "../home/Home";
import Avatar from "../../styles/Avatar";
import { useHistory } from "react-router-dom";
const InputWrapper = styled.input`
  padding: 0.4rem 0.6rem;
  background: ${(props) => props.theme.inputBg};
  color: ${(props) => props.theme.primaryColor};
  border: 1px solid ${(props) => props.theme.borderColor};
  font-family: "Fira Sans", sans-serif;
  font-size: 1rem;
  border-radius: ${(props) => props.theme.borderRadius};
`;

const SearchWrapper = styled.div`
width:100%;
z-index:3;
display:flex;
overflow-y:scroll;
max-height:300px;
width:220px;
border-top:1px solid white;
flex-direction:column;
flex-wrap:nowrap;
padding-top:1rem;
background :${(props) => props.theme.inputBg};
box-shadow:3px 3px 3px black;
.searchcomponent{
  width:100%;
  cursor:pointer;
  display:flex;
  flex-wrap:nowrap;
  padding:8px 6px;
}
.username{
  font-weight:bold;
  color:${(props) => props.theme.primaryColor};
}
.fullname{
  font-weight:normal;
  color:${(props) => props.theme.primaryColor};
}

`;


const Search = () => {
  const [isMobile,setIsMobile] = useState(false);
  const [Search, setSearch] = useState([]);
  useEffect(() => {
    if(window.innerWidth<671){
      setIsMobile(true);
    }
    if (Search.length > 0)
      setHide(false);
    else
      setHide(true);
  },[Search.length,setIsMobile])
  const SearchResults = ({ result }) => {
    return (
      <div style={{maxheight:"300px",overflowX:"hidden",zIndex:"5000"}}>
    <SearchWrapper style={{top:`${!isMobile?"50px":"120px"}`,position:`${isMobile?"absolute":"fixed"}`}}>
      {
        result.map((val) => {
          return (<div className="searchcomponent" key={val._id} onClick={() => {history.push(`/${val.username}`);setSearch([])}}>
            <Avatar src={val.avatar} alt="noti" style={{alignSelf:"center"}} />
            <div className="userinfo">
              <div className="username">
                {val.username}
              </div>
              <div className="fullname">
                {val.fullname}
              </div>
            </div>
          </div>
          )
        })
      }
    </SearchWrapper>
    </div>
    )
  }
  const searchterm = Modify("");
  const history = useHistory();
  const inpSearch = useRef(null);
  const [hide, setHide] = useState(true);
  
  const handleSearch = (e) => {
      
     setTimeout(function(){
      connect(`/user/search/${inpSearch.current.value}`).then((response) => {
        setSearch(response.data);        
        //console.log(Search);
      }).catch((err) => {        
        if (err.logout) {
          logout();
        }
      });
    },500)
   
    //searchterm.setValue("");
    //return toast.success("success");

  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "220px" }}>
      <InputWrapper
        type="text"
        ref={inpSearch}
        value={searchterm.value}
        onBlur={()=>setTimeout(function(){setSearch([])},500)}
        onKeyDown={handleSearch}
        onChange={searchterm.onChange}
        placeholder="Search a peep"
      />
      {!hide &&
        <SearchResults result={Search} />
      }
    </div>
  );
};

export default Search;