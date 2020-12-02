import React, { useState, useEffect } from "react";
import PostProfilePreview from "../dashboard/PostProfilePreview";
import Loader from "../utility/Loader";
import Search from "../utility/Search";
import { connect } from "../../utils/fetchdata";
import {logout} from "../home/Home";
const Highlight = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [Mobile,setMobile] = useState(false);

  useEffect(() => {
    if(window.innerWidth<671){
      setMobile(true);
    }
    connect("/complain/highlight").then((res) => {
      setPosts(res.data);
      setLoading(false);
    }).catch(err=>{
      if(err.logout){
        logout();
      }
    });
  }, [setMobile]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <div style={{ marginTop: "2.3rem" }}>
        {Mobile&&
        <div style={{margin:"auto",padding:"16px"}}>
        <Search/>
        </div>
      }
        <h2 style={{paddingLeft:"16px"}}>Trending complaints</h2>
        <PostProfilePreview posts={posts} />
      </div>
    </>
  );
};

export default Highlight;