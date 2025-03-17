import { io } from "socket.io-client";

const connectSocket = () => {
  const socket = io(`${import.meta.env.VITE_REACT_APP_SOCKET_URL}`);
  return socket;
};

export default connectSocket;
