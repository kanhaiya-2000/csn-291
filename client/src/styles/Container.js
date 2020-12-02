import styled from "styled-components";

const Container = styled.div`
  width: 930px;
  margin: 6.5rem auto;
  margin-bottom: 4rem;
  @media screen and (max-width: 930px) {
    width: 100%;
  }
  @media screen and (max-width: 800px) {
    width: 100%;
    margin: 4.5rem auto;
  }
  @media screen and (max-width: 530px) {
    font-size: 0.9rem;
  }
`;

export default Container;