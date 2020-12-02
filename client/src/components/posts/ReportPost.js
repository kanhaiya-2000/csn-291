import React from "react";
import Button from "../../styles/Button";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useHistory, useParams } from "react-router-dom";
import { connect } from "../../utils/fetchdata";
import modify from "../../hooks/Modify";
import {Wrapper} from "../dashboard/ProfileForm";
import {logout} from "../home/Home";

const TopWrapper = styled.div`
  width: 930px;
  border: 1px solid ${(props) => props.theme.borderColor};
  display: grid;
  background: ${(props) => props.theme.white};
  .tabs {
    border-right: 1px solid ${(props) => props.theme.borderColor};
    padding: 1rem;
  }
  .report-form-container {
    display: flex;
    justify-content: center;
  }
  @media screen and (max-width: 970px) {
    width: 90%;
  }
  @media screen and (max-width: 700px) {
    width: 98%;
  }
  @media screen and (max-width: 550px) {
    width: 99%;
  }
`;

const ReportPost = () => {  
  const history = useHistory();
  const {postId} = useParams();
  const reportText = modify("");
  
 const submitReport = (e)=>{
     e.preventDefault();
     if(reportText.value.length>150){
         const body = {
             reportText:reportText.value
         }    
    connect(`/complain/report/${postId}`, {body}).then(()=>{
        toast.success("Thanks!We will take necessary action!");
        history.push('/')
    }).catch(err=>{
      err.logout&&logout();
        toast.error(err.message);
    });
    }
    else{
        toast.error("Minimum character in report must be 150")
    }
 }
 return (
    <>
       {<TopWrapper>
      <div className="report-form-container">
        <Wrapper>
          <form onSubmit={submitReport}>
          <div className="input-group textarea-group" style={{height:"100px"}}>
            <label className="bold">Report</label>
            <textarea
              cols="10"
              value={reportText.value}
              onChange={reportText.onChange}
            ></textarea>
          </div>
  
          <Button>Submit</Button>
        </form>
        </Wrapper>
        </div>
        </TopWrapper>
      }
      </>
)
  
};

export default ReportPost;