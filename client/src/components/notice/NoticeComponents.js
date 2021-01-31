import React from "react";
import styled from "styled-components";
//import Modal from "./Modal";
import { useHistory } from "react-router-dom";
import Avatar from "../../styles/Avatar";
import { timeSince } from "../../utils/fetchdata";
import Skeleton from "react-loading-skeleton";


export const NoticeWrapper = styled.div`
  width: 100%;
  margin:auto;
  cursor:pointer;
  display:flex;
  flex-wrap:nowrap;
  background: ${(props) => props.theme.white};
  border-bottom: 1px solid ${(props) => props.theme.borderColor};
  margin-bottom: 0px;
  .notice-avatar {
    height:100%;
    width:50px;
    padding-left:5px;
    align-self: center;
  }
 
  .pointer{
      cursor:pointer;
  }
  .notice-body {
    word-break:break-word;
    display:flex;
    flex-direction:column;
    justify-content:start;    
    padding: 8px;
  }
  .notice-footer{
      padding-left:7px;
      color:gray;
  }
  .middle{
      font-size:13px;
  }
  .notice-body-text{
      width:100%;
      float:left;      
      padding-left:7px;
      word-break:break-word;
  }
  
  @media screen and (max-width: 690px) {
    width: 100%;
  }
`;

const NoticeComponents = ({ notice }) => {
  const history = useHistory();
  if (!notice) {
    return (
      <NoticeWrapper>
        <div className="notice-avatar">
          <Skeleton
            circle={true}
            width={32}
            height={32}
            className={"pointer"}
          />
        </div>
        <div className="notice-body">
          <div className="notice-body-text">
            <Skeleton className={"middle"} width={290} height={16} />
          </div>
          <div className="notice-footer">
            <Skeleton width={20} height={8} />
          </div>
        </div>
      </NoticeWrapper>
    );
  }
  return (
    <NoticeWrapper onClick={() => { history.push(`${notice.url}`) }}>
      <div className="notice-avatar">
        <Avatar
          className="pointer"
          onContextMenu={(e)=>e.preventDefault()}
          src={notice?.avatar || "https://kkleap.github.io/assets/default_noti.jpg"}
          alt="noti"
        />
      </div>
      <div className="notice-body">
        <div className="notice-body-text">
          <p className={notice.seen ? "middle" : "bold"}>{notice.notifiedMessage}</p>
        </div>
        <div className="notice-footer">
          {timeSince(notice.createdAt)}
        </div>
      </div>
    </NoticeWrapper>
  );
}
export default NoticeComponents;