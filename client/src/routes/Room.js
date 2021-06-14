import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Link } from "react-router-dom";
import Peer from "simple-peer";
import styled from "styled-components";

const Container = styled.div`
  height: 100vh;
`;

const StyledVideo = styled.video`
  margin: 10px;
  height: 40%;
  width: 50%;
  display: flex;
  flex-direcion: row;
  border-radius: 25px;
`;

const Content = styled.div`
  height: 95vh;
`;

const Header = styled.div`
  font-size: 12px;
  background-color: #fff;
  height: 5vh;
  display: flex;
  align-items: center;
  width: 100vw;
  border-bottom: 2px solid black;
  h1 {
    &:hover {
      color: #af5a76;
    }
  }
`;

const StyledLink = styled(Link)`
  color: palevioletred;
  font-weight: bold;
`;

const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);

  return <StyledVideo playsInline autoPlay ref={ref} />;
};

function createPeer(socketRef, userToSignal, callerID, stream) {
  const peer = new Peer({
    initiator: true,
    trickle: false,
    stream,
  });

  peer.on("signal", (signal) => {
    socketRef.current.emit("creatingSignal", {
      userToSignal,
      callerID,
      signal,
    });
  });

  return peer;
}

function addPeer(socketRef, incomingSignal, callerID, stream) {
  const peer = new Peer({
    initiator: false,
    trickle: false,
    stream,
  });

  peer.on("signal", (signal) => {
    socketRef.current.emit("returningSignal", { signal, callerID });
  });

  peer.signal(incomingSignal);

  return peer;
}

function Room(props) {
  const [peers, setPeers] = useState([]);
  const userVideo = useRef();

  const socketRef = useRef();
  const peersRef = useRef([]);

  const roomID = props.match.params.id;

  useEffect(() => {
    socketRef.current = io.connect("/"); // Conecta com o server

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;

        socketRef.current.emit("join", roomID);

        socketRef.current.on("all users", (users) => {
          const peers = [];
          users.forEach((userID) => {
            const peer = createPeer(
              socketRef,
              userID,
              socketRef.current.id,
              stream
            );
            peersRef.current.push({
              peerID: userID,
              peer,
            });
            peers.push(peer);
          });
          setPeers(peers);
        });

        socketRef.current.on("joinUser", (payload) => {
          const peer = addPeer(
            socketRef,
            payload.signal,
            payload.callerID,
            stream
          );

          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });

          setPeers((users) => [...users, peer]);
        });

        socketRef.current.on("receivingReturnSignal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });
      });
  }, []);

  return (
    <Container>
      <Content>
        <Header>
          <StyledLink to={`/`}>
            <h1>Video Chat </h1>
          </StyledLink>
        </Header>
        <StyledVideo muted ref={userVideo} autoPlay playsInline />
        {peers.map((peer, index) => {
          return <Video key={index} peer={peer} />;
        })}
      </Content>
    </Container>
  );
}

export default Room;
