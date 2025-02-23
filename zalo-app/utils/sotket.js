import { io } from "socket.io-client";

const SOCKET_URL = `${process.env.REACT_APP_BACKEND_URL}`;

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
});
