import React, { useRef, useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useAuth } from "../../contexts/AuthContext";

const app_Id = Number(import.meta.env.VITE_ZEGOCLOUD_APP_ID);
const server_Secret = import.meta.env.VITE_ZEGOCLOUD_SERVER_SECRET;

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
      navigate("/home");
      return;
    }

    if (!videoContainerRef.current) {
      console.error("Video container not found");
      return;
    }

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
      maxUsers: type === "one-on-one" ? 2 : 6,
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
    if (!type) {
      console.error("No call type specified, defaulting to one-on-one");
      setCallType("one-on-one");
    } else {
      setCallType(type);
    }
  }, [location.search]);

  useEffect(() => {
    if (callType && user && videoContainerRef.current) {
      myMeeting(callType);
    }

    return () => {
      if (zpRef.current) {
        console.log("Destroying Zego instance");
        zpRef.current.destroy();
        zpRef.current = null;
      }
    };
  }, [callType, user, videoContainerRef.current]);

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
      <ErrorBoundary>
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
      </ErrorBoundary>
    </>
  );
}

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Đã xảy ra lỗi. Vui lòng thử lại.</h1>;
    }
    return this.props.children;
  }
}

export default Room;
