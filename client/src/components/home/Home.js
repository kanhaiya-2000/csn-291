import React, { useContext, useState, useEffect } from "react";
import styled from "styled-components";
import {toast} from "react-toastify";
import Suggestions from "../utility/Suggestions";
import NoFeedSuggestions from "../utility/NoFeedSuggestions";//to implement
import PostComponents from "../posts/PostComponents";
//import Loader from "../utility/Loader";
import { FeedContext } from "../../context/FeedContext";
import { UserContext } from "../../context/UserContext";
import { connect } from "../../utils/fetchdata";
import { ThemeContext } from "../../context/ThemeContext";
//import { post } from "../../../../routes/auth";
import  { SkeletonTheme } from "react-loading-skeleton";

const Wrapper = styled.div`
  width:100%;
  .home{
    width:100%;
  }
  @media screen and (max-width: 1040px) {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  @media screen and(max-width:680px){
    .home{
      margin-top:-20px;
    }
  }
`;
export const logout = () => {  
  localStorage.removeItem('userdetail');
  localStorage.removeItem('accesstoken');   
  window.location.reload();      
};

const Home = () => {
  const {setUser } = useContext(UserContext);
  const {theme} = useContext(ThemeContext);
  const { feed, setFeed } = useContext(FeedContext);
  //const {theme} = useContext(ThemeContext);
  const [loading,setLoading] = useState(true);
  useEffect(() => {   

    connect("/user/feed")
      .then((res) => {
        setFeed(res.data);
        setLoading(false);
      })
			.catch(res => {console.log(res);toast.error("Unable to load feed"); res.logout&&logout();});
  }, [setFeed, setUser]);
if(loading)
  return(
    <SkeletonTheme color={theme.skeleton}>
    <Wrapper>
      <>
      <div className="home">
       <PostComponents/>
      </div>
      <Suggestions noLoad={true}/>
      </>
    </Wrapper>
    </SkeletonTheme>
  )

  return (
    <SkeletonTheme color={theme.skeleton}>
    <Wrapper>
      {feed.length > 0 ? (
        <>
          <div className="home">
            {feed.map((post) => (              
              <PostComponents key={post._id} post={post} />
              
            ))}
          </div>
          <Suggestions key={1}/>{" "}
        </>
      ) : (
        <NoFeedSuggestions /> //to implement here
      )}
    </Wrapper>
    </SkeletonTheme>
  );
};

export default Home;