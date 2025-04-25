// import React from "react";
// import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

// function randomID(len) {
//   let result = "";
//   if (result) return result;

//   var chars = "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP",
//     maxPos = chars.length,
//     i;
//   len = len || 5;
//   for (i = 0; i < len; i++) {
//     result += chars.charAt(Math.floor(Math.random() * maxPos));
//   }
//   return result;
// }

// export function getUrlParams(url = window.location.href) {
//   let urlStr = url.split("?")[1];
//   return new URLSearchParams(urlStr);
// }

// function Calls() {
//   console.log("Calls component loaded");
//   const roomId = getUrlParams().get("roomId") || randomID(5);
//   let myMeeting = async (element) => {
//     const appID = 1029886648;
//     const serverSecret = "40448dab078931ac60ba232fe278f62f";
//     const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
//       appID,
//       serverSecret,
//       roomId,
//       randomID(5),
//       randomID(5)
//     );

//     const zp = ZegoUIKitPrebuilt.create(kitToken);

//     zp.joinRoom({
//       container: element,
//       sharedLinks: [
//         {
//           name: "Personal Link",
//           url:
//             window.location.protocol +
//             "//" +
//             window.location.host +
//             window.location.pathname +
//             "?roomId=" +
//             roomId,
//         },
//       ],
//       scenario: {
//         mode: ZegoUIKitPrebuilt.GroupCall,
//       },
//     });
//   };

//   return (
//     <div
//       className="myCallContainer"
//       ref={myMeeting}
//       style={{ width: "100vw", height: "100vh" }}
//     ></div>
//   );
// }

// export default Calls;

import React, { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import socket from "../../socket/socket"; // Đảm bảo socket được import
import { useAuth } from "../../contexts/AuthContext";
import { app_Id, server_Secret } from "../../constants";

function randomID(len) {
  let result = "";
  const chars =
    "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
  const maxPos = chars.length;
  len = len || 5;
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export function getUrlParams(url = window.location.href) {
  let urlStr = url.split("?")[1];
  return new URLSearchParams(urlStr);
}

function Calls() {
  const { user } = useAuth();
  const roomIdFromUrl = getUrlParams().get("roomId");
  const [roomId, setRoomId] = useState(roomIdFromUrl || randomID(5));
  const myCallContainer = useRef(null);
  const hasJoinedRoom = useRef(false); // Thêm biến để kiểm soát việc gọi joinRoom

  // Phát sự kiện socket để chia sẻ roomId
  useEffect(() => {
    if (user && !roomIdFromUrl) {
      socket.emit("share-room", { roomId, userId: user.id });
    }
  }, [roomId, user, roomIdFromUrl]);

  // Lắng nghe sự kiện share-room từ người dùng khác
  useEffect(() => {
    socket.on("share-room", (data) => {
      if (data.userId !== user.id) {
        setRoomId(data.roomId);
      }
    });

    return () => {
      socket.off("share-room");
    };
  }, [user]);

  // Gọi joinRoom chỉ một lần
  useEffect(() => {
    const myMeeting = async (element) => {
      if (hasJoinedRoom.current) return; // Ngăn joinRoom gọi lại

      const appID = app_Id;
      const serverSecret = server_Secret;
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        randomID(5),
        user?.id || randomID(5)
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      zp.joinRoom({
        container: element,
        sharedLinks: [
          {
            name: "Personal Link",
            url:
              window.location.protocol +
              "//" +
              window.location.host +
              window.location.pathname +
              "?roomId=" +
              roomId,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall,
        },
      });

      hasJoinedRoom.current = true; // Đánh dấu đã gọi joinRoom
    };

    if (myCallContainer.current) {
      myMeeting(myCallContainer.current);
    }
  }, [roomId, user]);

  return (
    <div
      className="myCallContainer"
      ref={myCallContainer}
      style={{ width: "100vw", height: "100vh" }}
    ></div>
  );
}

export default Calls;
