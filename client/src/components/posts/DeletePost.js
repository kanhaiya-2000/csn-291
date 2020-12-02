import React, { useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { FeedContext } from "../../context/FeedContext";
import { connect } from "../../utils/fetchdata";
import {logout} from "../home/Home";

const DeletePost = ({ postId, closeModal, goToHome }) => {
  const { feed, setFeed } = useContext(FeedContext);
  const history = useHistory();

  const handleDeletePost = () => {
    closeModal();

    if (goToHome) {
      history.push(`/`);
    }

    setFeed(feed.filter((post) => post._id !== postId));
    
    try{
    connect(`/complain/${postId}`, { method: "DELETE" });
    toast.success("Your complain has been deleted successfully");
    }
    catch(err){
      if(err.logout){
        logout()
      }
      else
        toast.error(err.message);
    }
  };

  return (
    <span className="danger" onClick={handleDeletePost}>
      Delete Post
    </span>
  );
};

export default DeletePost;