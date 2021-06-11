import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
const { v4: uuiV4 } = require("uuid");

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Header = styled.div`
  padding-top: 15%;
  font-size: 42px;
`;

const StyledButton = styled.div`
  margin-right: 35%;
  margin-left: 35%;
  border-radius: 35px;
  background-color: palevioletred;
  font-size: 54px;
  padding: 20px;
  color: #fff;
  border: 3px solid black;
`;

const StyledLink = styled(Link)`
  color: #fff;
  font-weight: bold;
  text-decoration: none;
`;

function Home() {
  return (
    <Container>
      <Header>
        <h1>Video Chat</h1>
      </Header>
      <StyledButton>
        <StyledLink to={`room/${uuiV4()}`}>Create</StyledLink>
      </StyledButton>
    </Container>
  );
}

export default Home;
