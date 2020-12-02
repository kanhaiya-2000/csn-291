import React,{useContext} from "react";
import styled, { ThemeContext } from "styled-components";
import { BookmarkIcon, PostIcon,TaggedIcon } from "../../Icons";
//import {FeedContext} from "../../context/FeedContext";

const Wrapper = styled.div`
  margin: auto;
  margin-top: 4rem;
  width: 450px;
  text-align: center;
  p {
    padding-top: 0.3rem;
  }
  svg {
    height: 50px;
    width: 50px;
    margin-bottom: 1rem;
    fill: ${(props)=>props.theme.primaryColor} !important;
  }
  @media screen and (max-width: 500px) {
    svg {
      height: 35px;
      width: 35px;
      
    }
    width: 350px;
  }
`;

const Placeholder = ({ icon, title, text }) => {
  const {theme} = useContext(ThemeContext);
  return (
    <Wrapper>
      {icon === "bookmark" && <BookmarkIcon theme={theme} />}
      {icon === "post" && <PostIcon theme={theme} />}
      {icon==="tagmark"&&<TaggedIcon theme={theme}/>}
      <h2>{title}</h2>
      <p>{text}</p>
    </Wrapper>
  );
};

export default Placeholder;