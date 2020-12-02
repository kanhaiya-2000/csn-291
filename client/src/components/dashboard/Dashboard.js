import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import PostProfilePreview from "./PostProfilePreview";
import ProfileHeader from "./ProfileHeader";
import Placeholder from "../utility/Placeholder";
import Loader from "../utility/Loader";
import { PostIcon, SavedIcon,TaggedIcon } from "../../Icons";
import { connect } from "../../utils/fetchdata";

const Wrapper = styled.div`
  .dashboard-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 1.4rem 0;
      width: 600px;
      margin-left: auto;
      margin-right: auto;
    
  }
  .dashboard-tab div {
    display: flex;
    cursor: pointer;
    margin-right: 3rem;
  }
  .dashboard-tab span {
    padding-left: 0.3rem;
  }
  .dashboard-tab svg {
    height: 24px;
    width: 24px;
    fill: ${(props) => props.theme.primaryColor} !important;
  }
  hr {
    border: 0.5px solid ${(props) => props.theme.borderColor};
  }
  @media screen and (max-width:600px){
    .dashboard-tab{
      width:100%;
    }
  }
`;

const Dashboard = () => {
  const [tab, setTab] = useState("POSTS");
  const [errmsg,setErr] = useState("Error in getting data");
  
  const { username } = useParams();
  const [dashboard, setdashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [NotFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    connect(`/user/${username}`)
      .then((res) => {
        setLoading(false);
        setNotFound(false);
        setdashboard(res.data);
      })
      .catch((err) => {setErr(err.message);setNotFound(true)});
  }, [username]);

  if (!NotFound && loading) {
    return <Loader />;
  }

  if (NotFound) {
    return (
      <Placeholder
        title="Sorry, this page isn't available"
        text={errmsg}
      />
    );
  }

  return (
    <Wrapper>
      <ProfileHeader profile={dashboard} />
      <hr />

      <div className="dashboard-tab">
        <div
          style={{ fontWeight: tab === "POSTS" ? "500" : "" ,margin:"auto"}}
          onClick={() => setTab("POSTS")}
        >
          <PostIcon />
          <span>Posts</span>
        </div>
        <div
          style={{ fontWeight: tab === "TAGGED" ? "500" : "" ,margin:"auto"}}
          onClick={() => setTab("TAGGED")}
        >
          <TaggedIcon />
          <span>Tagged</span>
        </div>
       {dashboard.isMe&&( <div
          style={{ fontWeight: tab === "SAVED" ? "500" : "" ,margin:"auto"}}
          onClick={() => setTab("SAVED")}
        >
          <SavedIcon/><span>Saved</span>
          </div>
       )
    }      
          
        </div>      

      {tab === "POSTS" && (
        dashboard?.isMe?(
        <>
          {dashboard?.posts?.length === 0 ? (
            <Placeholder
              title="Posts"
              text="Once you start making new complain posts, they'll appear here"
              icon="post"
            />
          ) : (
            <PostProfilePreview posts={dashboard?.posts} />
          )}
        </>
        ):(
          <>
          {dashboard?.posts?.length === 0 ? (
            <Placeholder
              title="Posts"
              text="This user has not posted any complain yet"
              icon="post"
            />
          ) : (
            <PostProfilePreview posts={dashboard?.posts} />
          )}
        </>
        )
      )}

      {tab === "SAVED" &&dashboard.isMe&&(        
        <>
          {dashboard?.savedComplaints?.length === 0 ? (
            <Placeholder
              title="Saved"
              text="Save complaints that you want to see again"
              icon="bookmark"
            />
          ) : (
            <PostProfilePreview posts={dashboard?.savedComplaints} />
          )}
        </>)
}
        
        {tab==="TAGGED"&&(dashboard?.taggedComplaints?.length === 0 ? (
          <Placeholder
            title="Tagged"
            text={dashboard.isMe?"You were not tagged in any complaint":"This user was not tagged in any complaint"}
            icon="tagmark"
          />
        ) : (
          <PostProfilePreview posts={dashboard?.taggedComplaints} />
        ))}    
      
    </Wrapper>
  );
};

export default Dashboard;