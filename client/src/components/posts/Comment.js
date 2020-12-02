import React,{useState} from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
//import { MoreIcon } from "../../Icons";
import Avatar from "../../styles/Avatar";
import Modal from "./Modal";
import useLongPress from "./useLongPress";
//import {MoreIcon}  from "../../Icons";
import { connect, timeSince } from "../../utils/fetchdata";
import {logout} from "../home/Home";
import { toast } from "react-toastify";
import {ModalContentWrapper} from "./PostComponents";
// {ThemeContext} from "../../context/ThemeContext";
const CommentWrapper = styled.div`
  display: flex;
  max-width:85%;
  word-break:break-word;
  span {
    padding-right: 0.4rem;
  }
  svg{
    margin-left:auto;
    margin-right:1rem;
  }
`;
const ModalContent = ({ postId,commentId, isMine,closeModal,commentsStateF}) => {
  
  const handleDelete = () => {
    closeModal();
    connect(`/complain/${postId}/comments/${commentId}`,{method:"DELETE"}).then(()=>{
        //console.log(commentId);
        commentsStateF({commentId});
        return toast.success("Comment deleted successfully")
    }).catch((err)=>{
      err.logout&&logout();
      return toast.error(err.message)
    })

  }; 
  return (
    <Modal>
    <ModalContentWrapper>
      <span className="danger" onClick={closeModal}>
        Cancel
      </span>
      {isMine&&<span className="danger" onClick={handleDelete}>
        Delete comment
      </span>}      
    </ModalContentWrapper>
    </Modal>
  );
};
const Comment = ({ postId,comment, hideavatar ,commentsStateF,noTimeStamp}) => {
  const history = useHistory();  
  const [showModal,setShowModal] = useState(false);
  const onLongPress = () => {
    setShowModal(true);
};

const onClick = () => {
    console.log('click is triggered')
}
const closeModal = ()=>{
   setShowModal(false);
 }
const defaultOptions = {
    shouldPreventDefault: true,
    delay: 700,
};
const longPressEvent = useLongPress(onLongPress, onClick, defaultOptions);
  return (
    <>
    <CommentWrapper style={{ padding: !hideavatar ? "0.4rem 0" : "" }}>
      {!hideavatar && (
        <div>
        <Avatar
          className="pointer"
          onClick={() => history.push(`/${comment.user.username}`)}
          src={comment.user.avatar}
          alt="avatar"
        />
        </div>
      )}

      {comment.isCommentMine?<div id={comment._id}><p {...longPressEvent} style={{cursor:"pointer"}} >
        <span 
          onClick={() => history.push(`/${comment.user.username}`)}
          className="bold pointer"
        >
          {comment.user.username}
        </span>
        {comment.text}
        
      </p>{!noTimeStamp&&<span className="secondary">{timeSince(comment.createdAt)} ago</span>}</div>
     :<div id={comment._id}>
       <p>
       <span
         onClick={() => history.push(`/${comment.user.username}`)}
         className="bold pointer"
       >
         {comment.user.username}
       </span>
       {comment.text}       
     </p>{!noTimeStamp&&<span className="secondary">{timeSince(comment.createdAt)} ago</span>}</div>
     
}
      
    </CommentWrapper>
    {
      showModal&&(
        <Modal>
              <ModalContent
                postId={postId}
                commentsStateF={commentsStateF}
                closeModal={closeModal}
                isMine={comment.isCommentMine}
                commentId={comment._id}                
              />
          </Modal>
      )
    }
    </>
  );
};

export default Comment;