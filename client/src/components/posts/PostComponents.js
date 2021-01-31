import React, { useContext, useState } from "react";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import LikePost from "./LikePost";
import SavedComplaints from "./SavedComplaints";
import Comment from "./Comment";
import DeletePost from "./DeletePost";
import ResolveComplaints from "./ResolveComplaints";
import Modal from "./Modal";
import Modify from "../../hooks/Modify";
import Avatar from "../../styles/Avatar";
import { connect ,timeSince} from "../../utils/fetchdata";
import {ThemeContext} from "../../context/ThemeContext";
import { MoreIcon, CommentIcon, InboxIcon ,TickIcon,PrivateIcon} from "../../Icons";
import {logout} from "../home/Home";
import Skeleton from "react-loading-skeleton";
import LazyLoad from "react-lazyload";
import def from "../../assets/default.jpg";
import Loader from "../../assets/loader2.gif";
export const ModalContentWrapper = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  text-align: center;
  span:last-child {
    border: none;
  }
  
  span {
    display: block;
    padding: 1rem 0;
    border-bottom: 1px solid ${(props) => props.theme.borderColor};
    cursor: pointer;
  }
`;

export const ModalContent = ({ hideGotoPost, postId, closeModal,resolved,post,isMine}) => {
  const history = useHistory();  
  const handleGoToPost = () => {
    closeModal();
    history.push(`/p/${postId}`);
  };
  
  const ReportPost=()=>{
    history.push(`/report/${postId}`)
  }
  return (
    <ModalContentWrapper>
      <span className="danger" onClick={closeModal}>
        Cancel
      </span>
      {isMine?<DeletePost postId={postId} closeModal={closeModal} goToHome={true} />:
      <span className="danger" onClick={ReportPost}>
      Report
    </span>}
      {!hideGotoPost && <span onClick={handleGoToPost}>Go to Post</span>}      
      {isMine&&<ResolveComplaints postId={postId} closeModal={closeModal} isMarkResolved={resolved} post={post} />}
    </ModalContentWrapper>
  );
};

export const PostWrapper = styled.div`
  width: 615px;
  background: ${(props) => props.theme.white};
  border-bottom: 1px solid ${(props) => props.theme.borderColor};
  margin-bottom: 1.5rem;
  .post-header-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .loadpost{
    position:relative !important;
  }
  .mb-10{
    margin-bottom:-10px;
  }
  .pointer2{
   margin-top:10px;
   margin-left:20px;
   position:relative;
  }
  #pointer2{
    margin-left:5px;
  }
  .post-header {
    display: flex;
    align-items: center;
    padding: 1rem;
  }
  .post-header h3 {
    cursor: pointer;
  }
  .post-img {
    width: 100%;
    height: 100%;
  }
  .post-actions {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    padding-bottom: 0.2rem;
  }
  .post-actions svg:last-child {
    margin-left: auto;
  }
  .post-img-inverted{
    filter:invert(50%);
    width: 100%;
    height: 500px;
  }
  svg {
    margin-right: 1rem;
  }
  .likes-caption-comments {
    padding: 1rem;
    padding-top: 0.3rem;
  }
  .username {
    padding-right: 0.3rem;
  }
  .view-comments {
    color: ${(props) => props.theme.secondaryColor};
    cursor: pointer;
  }
  
  .submit-cmnt{
    color:#3a3aea;
    font-weight:bold;
    align-self:center;
    position:relative;
    top:3px;
    padding-right:3px;
  }
  .add-comment{
    display:flex;
    align-items:center;
    flex-wrap:nowrap;
    border-top: 1px solid ${(props) => props.theme.borderColor};
    height:50px;
    max-height:100px;
    padding:2px 5px;
  }
  textarea {
    height: 43px;
    width: 100%;
    border: none;
    
    resize: none;
    padding: 0.8rem 0;
    font-size: 1rem;
    font-family: "Fira Sans", sans-serif;
  }
  @media screen and (max-width: 690px) {
    width: 100%;
  }
`;

const PostComponents = ({ post }) => {
  const comment = Modify("");
  const history = useHistory();
  const {theme} = useContext(ThemeContext);
  const [showModal, setShowModal] = useState(false);
  const [loaderr,setLoadErr] = useState(true);
  const closeModal = () => {
    setShowModal(false);    
  }
  const showToast = ()=>{
    return toast.success("This is a private complaint");
  }
  const [newComments, setNewComments] = useState([]);
  const [likesState, setLikes] = useState(post?.likesCount);
  const errorhandle = (id)=>{
    document.getElementById(id).src=Loader;
    document.getElementById(id).style.filter = `invert(${theme.skeleton==="#222"?1:0})`;
    if(loaderr){
      toast.error("Double click/tap to reload post image");
      setLoadErr(false);
    }
  }
  const incLikes = () => setLikes(likesState + 1);
  const decLikes = () => setLikes(likesState - 1);
  const handleAddComment = () => {
    if(!comment.value){
      return;
    }
      connect(`/complain/${post._id}/comments`, {
        body: { text: comment.value },
      }).then((resp) => setNewComments([...newComments, resp.data])).catch((err)=>{
        if(err.logout)
          logout();
      });

      comment.setValue("");
    
  };
  if(!post){
    return <PostWrapper>
    <div className="post-header-wrapper">
      <div className="post-header">      
        <Skeleton circle={true} className={"pointer2"} bottom={-3} width={32} height={32}/>      
        
          <Skeleton className={"pointer2"} width={80} height={20} id={"pointer"}/>          
        
      </div>

      
    </div>
    <Skeleton className={"post-img loadpost"} height={400}/>
    <div className="post-header-wrapper">
      <div className="post-header">      
        <Skeleton circle={true} className={"pointer2"} width={32} height={32}/>      
        
          <Skeleton className={"pointer2"} width={80} height={20} id={"pointer"}/>          
      
      </div>

      
    </div>
    <Skeleton className={"post-img loadpost"}  height={400}/><div className="post-header-wrapper">
      <div className="post-header">      
        <Skeleton circle={true} className={"pointer2"} width={32} height={32}/>      
      
          <Skeleton className={"pointer2"} width={80} height={20} id={"pointer"}/>          
        
      </div>

      
    </div>
    <Skeleton className={"post-img loadpost"}  height={400}/><div className="post-header-wrapper">
      <div className="post-header">      
        <Skeleton circle={true} className={"pointer2"} width={32} height={32}/>      
          <Skeleton className={"pointer2"} width={80} height={20} id={"pointer"}/>          
        
      </div>

      
    </div>
    <Skeleton className={"post-img loadpost"}  height={400}/><div className="post-header-wrapper">
      <div className="post-header">      
        <Skeleton circle={true} className={"pointer2"} width={32} height={32}/>      
      
          <Skeleton className={"pointer2"} width={80} height={20} id={"pointer"}/>          
        
      </div>

      
    </div>
    <Skeleton className={"post-img loadpost"}  height={400}/><div className="post-header-wrapper">
      <div className="post-header">      
        <Skeleton circle={true} className={"pointer2"} width={32} height={32}/>      
      
          <Skeleton className={"pointer2"} width={80} height={20} id={"pointer"}/>          
        
      </div>

      
    </div>
    <Skeleton className={"post-img loadpost"}  height={400}/><div className="post-header-wrapper">
      <div className="post-header">      
        <Skeleton circle={true} className={"pointer2"} width={32} height={32}/>      
          <Skeleton className={"pointer2"} width={80} height={20} id={"pointer"}/>          
       
      </div>

      
    </div>
    <Skeleton className={"post-img loadpost"}  height={400}/><div className="post-header-wrapper">
      <div className="post-header">      
        <Skeleton circle={true} className={"pointer2"} width={32} height={32}/>      
          <Skeleton className={"pointer2"} width={80} height={20} id={"pointer"}/>          
    
      </div>

      
    </div>
    <Skeleton className={"post-img loadpost"}  height={400}/><div className="post-header-wrapper">
      <div className="post-header">      
        <Skeleton circle={true} className={"pointer2"} width={32} height={32}/>      
          <Skeleton className={"pointer2"} width={80} height={20} id={"pointer"}/>          
        
      </div>

      
    </div>
    <Skeleton className={"post-img loadpost"}  height={400}/><div className="post-header-wrapper">
      <div className="post-header">      
        <Skeleton circle={true} className={"pointer2"} width={32} height={32}/>      
      
          <Skeleton className={"pointer2"} width={80} height={20} id={"pointer"}/>          
        
      </div>

      
    </div>
    <Skeleton className={"post-img loadpost"}  height={400}/><div className="post-header-wrapper">
      <div className="post-header">      
        <Skeleton circle={true} className={"pointer2"} width={32} height={32}/>      
          <Skeleton className={"pointer2"} width={80} height={20} id={"pointer"}/>          
        
      </div>

      
    </div>
    <Skeleton className={"post-img loadpost"}  height={400}/>
  </PostWrapper>
  }
  return (
    <PostWrapper>
      <div className="post-header-wrapper">
        <div className="post-header">
        {post.resolved&&<TickIcon/>}
         <LazyLoad
         offset={-50}
          once={true}
          placeholder={<Avatar
            className="pointer mb-10"
            src={def}
            alt="avatar"
            onClick={() => history.push(`/${post.user?.username}`)}
          />}>
          <Avatar
            className="pointer mb-10"
            src={post.user?.avatar}
            onContextMenu={(e)=>e.preventDefault()}
            onError={(e)=>e.src={def}}
            alt="avatar"
            onClick={() => history.push(`/${post.user?.username}`)}
          />
          </LazyLoad>
        {post.isPrivate&&<PrivateIcon fill={theme.primaryColor} transform={"scale(1.2)"} onClick={showToast}/>}
          <h3
            className="pointer"
            onClick={() => history.push(`/${post.user?.username}`)}
          >
            {post.user?.username}
          </h3>
        </div>

        {showModal && (
          <Modal>
            <ModalContent isMine={post.isMine} postId={post._id} closeModal={closeModal} resolved={post.resolved} />
          </Modal>
        )}
        
        {<MoreIcon theme={theme} onClick={() => setShowModal(true)} />}
      </div>
      <LazyLoad
      offset={-150}
      once={true}
      placeholder={<img alt="" className="post-img" src={Loader} style={{filter:`invert(${theme.skeleton==="#222"?1:0})`}}/>}>
      {post.files[0]?
      <img
        className="post-img"
        id={post._id.toString()}
        src={post.files[0]}
        style={{filter:"invert(0)"}}
        onContextMenu={(e)=>e.preventDefault()}
        onDoubleClick={()=>{document.getElementById(post._id.toString()).src=post.files[0];document.getElementById(post._id.toString()).style.filter="invert(0)"}}
        onError={()=>errorhandle(post._id.toString())}
        alt="post-img"
      />
      :
      <img
        className="post-img-inverted"        
        src={"https://kkleap.github.io/assets/loaderi.gif"}
        alt="post-img"
      />
}

</LazyLoad>
      <div className="post-actions">
        <LikePost
          isLiked={post.isLiked}
          postId={post._id}
          incLikes={incLikes}
          decLikes={decLikes}
        />
        <CommentIcon theme={theme} onClick={() => history.push(`/p/${post._id}`)} />
        <CopyToClipboard text={`see this complaint post by ${post.user.username}. Open the link ${window.location.origin}/p/${post._id}`} onCopy={() => toast.success("Link copied to clipboard")}><InboxIcon theme={theme} /></CopyToClipboard>
        <SavedComplaints isSaved={post.isSaved} postId={post._id} />
      </div>

      <div className="likes-caption-comments">
        {likesState !== 0 && (
          <span className="likes bold" style={{cursor:"pointer"}} onClick={()=>history.push(`/p/${post._id}`)}>
            {likesState} {likesState > 1 ? "likes" : "like"}
          </span>
        )}

        <p>
          <span
            onClick={() => history.push(`/${post.user?.username}`)}
            className="pointer username bold"
          >
            {post.user?.username}
          </span>
          {post.caption}
        </p>

        {post.commentsCount > 2 && (
          <span
            onClick={() => history.push(`/p/${post._id}`)}
            className="view-comments"
          >
            View all {post.commentsCount} comments
          </span>
        )}

        {post.comments?.slice(0, 2).map((comment) => (
          <Comment noTimeStamp={true} key={comment._id} hideavatar={true} comment={comment} />
        ))}

        {newComments.map((comment) => (
          <Comment noTimeStamp={true} key={comment._id} hideavatar={true} comment={comment} />
        ))}

        <span className="secondary">{timeSince(post?.createdAt)} ago</span>
      </div>

      <div className="add-comment">
        <textarea
          columns="3"
          placeholder="Add a Comment"
          value={comment.value}
          onChange={comment.onChange}
          onKeyDown={(e)=>e.keyCode===13&&handleAddComment()}          
        ></textarea>
        <span onClick={handleAddComment} className="pointer submit-cmnt">POST</span>
      </div>
    </PostWrapper>
  );
};

export default PostComponents;
