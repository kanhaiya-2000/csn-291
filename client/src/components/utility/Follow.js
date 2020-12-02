import React, { useEffect, useState } from "react";
import Button from "../../styles/Button";
import { connect } from "../../utils/fetchdata";
import {logout} from "../home/Home";

const Follow = ({ nobtn, isFollowing, incFollowers, decFollowers, userId,myId }) => {
  const [followingState, setFollowingState] = useState(isFollowing);
  
  useEffect(() => setFollowingState(isFollowing), [isFollowing]);

  const handleFollow = () => {
    if (followingState) {
      setFollowingState(false);
      if (decFollowers) {
        decFollowers();
      }
      try{
      connect(`/user/${userId}/unfriend`);
      }
      catch(err){
        err.logout&&logout();
      }
    } else {
      setFollowingState(true);
      if (incFollowers) {
        incFollowers();
      }
      try{
      connect(`/user/${userId}/friend`);
      }
      catch(err){
        err.logout&&logout();
      }
    }
  };

  if (followingState) {
    return (
      <>
        {nobtn ? (
          <span
            style={{ color: "#262626" }}
            className="pointer"
            onClick={() => handleFollow()}
          >
            Following
          </span>
        ) : (
          <Button onClick={() => handleFollow()}>Following</Button>
        )}
      </>
    );
  } else {
    return (      
      <>      
        {myId!==userId&&(nobtn ? (
          <span className="pointer" onClick={() => handleFollow()}>
            Follow
          </span>
        ) : (
          <Button onClick={() => handleFollow()}>Follow</Button>
        ))}
      </>
    );
  }
};

export default Follow;