import React from "react";
import styled,{keyframes} from "styled-components";

const IntroText = keyframes`
 from{
   opacity:0;
 }
 to{
   opacity:1;
 }
`;
const TitleInfo = styled.div`
  float:left;
  .intro{
  margin-top:15rem;
  margin-left:150px;
  text-align:justify;
  width:500px !important;
  font-size:20px;
  animation: ${IntroText} 1s ease-out;
  }
  h1{
    font-weight:bold;
    color: ${(props) => props.theme.blue};
  }
  @media (max-width:875px){
    .intro{
      margin:20px;
      width:95% !important;
      
      padding:10px;
    }
  }
`;
const Header = ()=>{
    return (
        <TitleInfo>
        <div className="intro" style={{width:"100%"}}>
        <h1>Complain Lodger</h1>
        <p>The place where everyone comes with hope of resolving their complaints.This project is an attempt to resolve the complaints of our IITR-JANTA by providing them an 
          online platform where they can lodge their complaints and get them resolved easily while sitting in their hostel room
        </p>
        </div>
      </TitleInfo>
    )
}
export default Header;