import React,{useContext} from "react";
import {ThemeContext} from "../../context/ThemeContext";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { HeartIcon, CommentIcon } from "../../Icons";
import Skeleton,{ SkeletonTheme } from "react-loading-skeleton";
import LazyLoad from "react-lazyload";
import Loader from "../../assets/loader2.gif";

const Wrapper = styled.div`
	margin-top: 1rem;
	cursor: pointer;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-gap: 1.5rem;
	img ,.imgs{
		border-radius: 4px;
		box-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
		width: 300px;
		height: 300px;
		object-fit: cover;
	}
	.container-overlay {
		position: relative;
	}
	.container-overlay > span{
		width:100%;
	}
	.container-overlay:hover .overlay {
		display: block;
	}
	.overlay {
		border-radius: 4px;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.6);
		width: 300px;
		height: 300px;
		z-index: 4;
		display: none;
	}
	.overlay-content {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		color: #EEE;
		font-weight: 500;
		font-size: 1.1rem;
	}
	svg {
		fill: #EEE !important;
		position: relative;
		top: 4px;
	}
	span {
		display: flex;
		display: block;
		align-items: center;
		padding-right: 0.5rem;
	}
	span:first-child {
		margin-right: 1rem;
	}
	@media screen and (max-width: 1000px) {
		img,.imgs, .overlay {
		width: 233px;
		height: 233px;
	}
	@media screen and (max-width: 800px) {
		img,.imgs, .overlay {
		width: 200px;
		height: 200px;
	}
	@media screen and (max-width: 700px) {
		grid-template-columns: 1fr 1fr;
		img,.imgs, .overlay {
			height: 240px;
			width: 100%;
	}
	@media screen and (max-width: 500px) {
		grid-gap: 1rem;
		img,.imgs, .overlay {
			height: 200px;
			width: 100%;
	}
	@media screen and (max-width: 400px) {
		img,.imgs, .overlay {
			background: rgba(0, 0, 0, 0) linear-gradient(-90deg, rgb(18, 18, 18) 0%, rgb(22, 22, 22) 50%, rgb(18, 18, 18) 100%) repeat scroll 0% 0% / 400% 400%;
			height: 170px;
			width: 100%;
	}
	}
`;

const PostProfilePreview = ({ posts }) => {
  const history = useHistory();
  const {theme} = useContext(ThemeContext);
  
  const errorhandle = (id)=>{
    document.getElementById(id).src=Loader;
    document.getElementById(id).style.filter = `invert(${theme.skeleton==="#222"?1:0})`;
  }
 if(!posts){
	return <SkeletonTheme color={theme.skeleton}>
	<Wrapper>	
	<div		
		className="container-overlay"		
	  >
		<Skeleton className={"imgs"} />
	  </div>
	  <div		
		className="container-overlay"		
	  >
		<Skeleton className={"imgs"} />
	  </div>
	  <div		
		className="container-overlay"		
	  >
		<Skeleton className={"imgs"} />
	  </div>
	  <div		
		className="container-overlay"		
	  >
		<Skeleton className={"imgs"} />
	  </div>
	  <div		
		className="container-overlay"		
	  >
		<Skeleton className={"imgs"} />
	  </div>
	  <div		
		className="container-overlay"		
	  >
		<Skeleton className={"imgs"} />
	  </div>	
  </Wrapper>
  </SkeletonTheme>
 }
  return (
    <Wrapper>
      {posts?.map((post) => (
        <div
          key={post._id}
          className="container-overlay"
          onClick={() => history.push(`/p/${post._id}`)}
        >
          <LazyLoad once={true} offset={-150}
      placeholder={<img alt="" className="post-img" src={Loader} style={{filter:`invert(${theme.skeleton==="#222"?1:0})`}}/>}><img onContextMenu={(e)=>e.preventDefault()} id={post._id.toString()} onError={()=>errorhandle(post._id.toString())} src={post.files[0]||"https://kkleap.github.io/assets/loaderi.gif"} alt="post" /></LazyLoad>
          <div className="overlay">
            <div className="overlay-content">
              <span style={{color:"white !important"}}>
                <HeartIcon theme={theme}/> {post.likesCount}
              </span>
              <span style={{color:"white !important"}}>
                <CommentIcon theme={theme}/> {post.commentsCount}
              </span>
            </div>
          </div>
        </div>
      ))}
    </Wrapper>
  );
};

export default PostProfilePreview;