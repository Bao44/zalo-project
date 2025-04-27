// import React, { useRef, useState, useEffect } from "react";
// import { useParams, useLocation, useNavigate } from "react-router-dom";
// import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
// import { app_Id, server_Secret } from "../../constants";
// import { useAuth } from "../../contexts/AuthContext";

// function Room() {
//   const { user } = useAuth();
//   const { roomId } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const zpRef = useRef(null);
//   const videoContainerRef = useRef(null);
//   const [joined, setJoined] = useState(false);
//   const [callType, setCallType] = useState("");

//   const myMeeting = (type) => {
//     console.log("Initializing ZegoUIKitPrebuilt with type:", type);
//     const appID = app_Id;
//     const serverSecret = server_Secret;
//     const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
//       appID,
//       serverSecret,
//       roomId,
//       Date.now().toString(),
//       "Your Name"
//     );

//     const zp = ZegoUIKitPrebuilt.create(kitToken);
//     zpRef.current = zp;

//     console.log("Joining room with roomId:", roomId);
//     zp.joinRoom({
//       container: videoContainerRef.current,
//       // sharedLinks: [
//       //   {
//       //     name: "Video Call Link",
//       //     url:
//       //       window.location.protocol +
//       //       "//" +
//       //       window.location.host +
//       //       window.location.pathname +
//       //       "?type=" +
//       //       encodeURIComponent(type),
//       //   },
//       // ],
//       sharedLinks: [
//         {
//           name: "Video Call Link",
//           url:
//             window.location.protocol +
//             "//" +
//             window.location.host +
//             `/room/${roomId}?type=` +
//             encodeURIComponent(type),
//         },
//       ],
//       scenario: {
//         mode:
//           type === "one-on-one"
//             ? ZegoUIKitPrebuilt.OneONoneCall
//             : ZegoUIKitPrebuilt.GroupCall,
//       },
//       maxUsers: type === "one-on-one" ? 2 : 10,
//       onJoinRoom: () => {
//         console.log("Successfully joined room");
//         setJoined(true);
//       },
//       onLeaveRoom: (reason) => {
//         console.log("User left room, reason:", reason);
//         if (reason !== "ERROR" && reason !== "DEVICE_ERROR") {
//           navigate("/home");
//         } else {
//           alert(
//             "Không thể tham gia vì thiếu quyền truy cập camera/microphone."
//           );
//         }
//       },
//     });
//   };

//   const handleExit = () => {
//     if (zpRef.current) {
//       zpRef.current.destroy();
//     }
//     navigate("/home");
//   };

//   useEffect(() => {
//     const query = new URLSearchParams(location.search);
//     const type = query.get("type");
//     console.log("Query type:", type); // Debug log
//     if (!type) {
//       console.error("No call type specified, defaulting to one-on-one");
//       setCallType("one-on-one");
//     } else {
//       setCallType(type);
//     }
//   }, [location.search]);

//   useEffect(() => {
//     const requestPermissions = async () => {
//       try {
//         await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       } catch (error) {
//         console.error("Permission error:", error);
//         alert(
//           "Please grant camera and microphone permissions to join the call."
//         );
//         navigate("/home");
//       }
//     };

//     requestPermissions();
//   }, [navigate]);

//   useEffect(() => {
//     if (callType && user) {
//       myMeeting(callType);
//     }

//     // Chỉ hủy Zego instance khi component thực sự unmount
//     return () => {
//       if (zpRef.current) {
//         console.log("Destroying Zego instance");
//         zpRef.current.destroy();
//         zpRef.current = null;
//       }
//     };
//   }, [callType, user]);

//   return (
//     <>
//       <style>{`
//         .room-container {
//           display: flex;
//           flex-direction: column;
//           height: 100vh;
//         }

//         .room-header {
//           background-color: #282c34;
//           color: white;
//           padding: 1rem;
//           text-align: center;
//           font-size: 1.5rem;
//         }

//         .exit-button {
//           position: absolute;
//           top: 1rem;
//           right: 1rem;
//           padding: 0.5rem 1rem;
//           background-color: red;
//           color: white;
//           border: none;
//           border-radius: 0.25rem;
//           cursor: pointer;
//         }

//         .video-container {
//           flex: 1;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           height: calc(100vh - 3rem);
//         }
//       `}</style>
//       <div className="room-container">
//         {!joined && (
//           <>
//             <header className="room-header">
//               {callType === "one-on-one"
//                 ? "One-on-One Video Call"
//                 : "Group Video Call"}
//             </header>
//             <button className="exit-button" onClick={handleExit}>
//               Exit
//             </button>
//           </>
//         )}
//         <div ref={videoContainerRef} className="video-container" />
//       </div>
//     </>
//   );
// }

// export default Room;

import React, { useRef, useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { app_Id, server_Secret } from "../../constants";
import { useAuth } from "../../contexts/AuthContext";

function Room() {
  const { user } = useAuth();
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const zpRef = useRef(null);
  const videoContainerRef = useRef(null);
  const [joined, setJoined] = useState(false);
  const [callType, setCallType] = useState("");

  const myMeeting = (type) => {
    if (!user) {
      console.error("No authenticated user found");
      navigate("/home");
      return;
    }

    console.log("Initializing ZegoUIKitPrebuilt with type:", type);
    const appID = app_Id;
    const serverSecret = server_Secret;
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomId,
      user.id,
      user.name || "Chưa đặt tên"
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zpRef.current = zp;

    console.log("Joining room with roomId:", roomId);
    zp.joinRoom({
      container: videoContainerRef.current,
      sharedLinks: [
        {
          name: "Video Call Link",
          url:
            window.location.protocol +
            "//" +
            window.location.host +
            `/room/${roomId}?type=` +
            encodeURIComponent(type),
        },
      ],
      scenario: {
        mode:
          type === "one-on-one"
            ? ZegoUIKitPrebuilt.OneONoneCall
            : ZegoUIKitPrebuilt.GroupCall,
      },
      maxUsers: type === "one-on-one" ? 2 : 10,
      onJoinRoom: () => {
        console.log("Successfully joined room");
        setJoined(true);
      },
      onLeaveRoom: (reason) => {
        console.log("User left room, reason:", reason);
        if (reason !== "ERROR" && reason !== "DEVICE_ERROR") {
          navigate("/home");
        } else {
          alert(
            "Không thể tham gia vì thiếu quyền truy cập camera/microphone."
          );
        }
      },
    });
  };

  const handleExit = () => {
    if (zpRef.current) {
      zpRef.current.destroy();
    }
    navigate("/home");
  };

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const type = query.get("type");
    console.log("Query type:", type);
    if (!type) {
      console.error("No call type specified, defaulting to one-on-one");
      setCallType("one-on-one");
    } else {
      setCallType(type);
    }
  }, [location.search]);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch (error) {
        console.error("Permission error:", error);
        alert(
          "Vui lòng cấp quyền sử dụng camera và micrô để tham gia cuộc gọi"
        );
        navigate("/home");
      }
    };

    requestPermissions();
  }, [navigate]);

  useEffect(() => {
    if (callType && user) {
      myMeeting(callType);
    }

    return () => {
      if (zpRef.current) {
        console.log("Destroying Zego instance");
        zpRef.current.destroy();
        zpRef.current = null;
      }
    };
  }, [callType, user]);

  return (
    <>
      <style>{`
        .room-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }

        .room-header {
          background-color: #282c34;
          color: white;
          padding: 1rem;
          text-align: center;
          font-size: 1.5rem;
        }

        .exit-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.5rem 1rem;
          background-color: red;
          color: white;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
        }

        .video-container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          height: calc(100vh - 3rem);
        }
      `}</style>
      <div className="room-container">
        {!joined && (
          <>
            <header className="room-header">
              {callType === "one-on-one"
                ? "One-on-One Video Call"
                : "Group Video Call"}
            </header>
            <button className="exit-button" onClick={handleExit}>
              Thoát
            </button>
          </>
        )}
        <div ref={videoContainerRef} className="video-container" />
      </div>
    </>
  );
}

export default Room;
