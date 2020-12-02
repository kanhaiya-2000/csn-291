import React, { useEffect, useState,useContext } from "react";
import { connect } from "../../utils/fetchdata";
import {ThemeContext} from "../../context/ThemeContext";
import { HeartIcon, FilledHeartIcon } from "../../Icons";
import {logout} from "../home/Home";

const LikePost = ({ isLiked, postId, incLikes, decLikes }) => {
  const [likedState, setLiked] = useState(isLiked);
  const {theme} = useContext(ThemeContext);

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  const handleToggleLike = () => {
    if (likedState) {
      setLiked(false);
      decLikes();
      try{
      connect(`/complain/${postId}/toggleLike`);
      }
      catch(err){
        if(err.logout){
          logout();
        }
      }
    } else {
      setLiked(true);
      incLikes();
      try{
      connect(`/complain/${postId}/toggleLike`);
      }
      catch(err){
        if(err.logout){
          logout();
        }
      }
    }
  };

  if (likedState) {
    return <FilledHeartIcon onClick={handleToggleLike} />;
  }

  if (!likedState) {
    return <HeartIcon onClick={handleToggleLike} theme={theme}/>;
  }
};

export default LikePost;