import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../socket/socket";
import { useAuth } from "../../contexts/AuthContext";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { ToastContainer } from "react-toastify";

function Call() {
  const { user } = useAuth();
  const [roomId, setRoomId] = useState("");
  const [targetUserIds, setTargetUserIds] = useState([]); // Thay đổi thành mảng
  const [onlineUsers, setOnlineUsers] = useState([]);
  const navigate = useNavigate();

  const handleRoomIdGenerate = () => {
    const randomId = Math.random().toString(36).substring(2, 9);
    const timestamp = Date.now().toString().slice(-4);
    setRoomId(randomId + timestamp);
  };

  useEffect(() => {
    handleRoomIdGenerate(); // Tạo roomId ngay khi component được tải
  }, []);

  const handleOneAndOneCall = () => {
    if (!roomId) {
      alert("Vui lòng tạo RoomID trước");
      return;
    }
    if (targetUserIds.length !== 1) {
      alert("Vui lòng chọn đúng một người cho cuộc gọi trực tiếp");
      return;
    }

    socket.emit("send-room-invitation", {
      targetUserId: targetUserIds[0], // Gửi cho một người
      roomId,
      callType: "one-on-one",
    });
    navigate(`/room/${roomId}?type=one-on-one`);
  };

  // const handleGroupCall = () => {
  //   if (!roomId) {
  //     alert("Vui lòng tạo RoomID trước");
  //     return;
  //   }
  //   if (targetUserIds.length === 0) {
  //     alert("Vui lòng chọn ít nhất một người để gọi nhóm");
  //     return;
  //   }

  //   // Gửi lời mời đến từng người dùng trong targetUserIds
  //   targetUserIds.forEach((targetUserId) => {
  //     socket.emit("send-room-invitation", {
  //       targetUserId,
  //       roomId,
  //       callType: "group-call",
  //     });
  //   });
  //   navigate(`/room/${roomId}?type=group-call`);
  // };

  const handleGroupCall = () => {
    if (!roomId) {
      alert("Vui lòng tạo RoomID trước");
      return;
    }
    if (targetUserIds.length === 0) {
      alert("Vui lòng chọn ít nhất một người để gọi nhóm");
      return;
    }

    // Lọc các user online
    const validTargetUserIds = targetUserIds.filter((id) =>
      onlineUsers.includes(id)
    );
    if (validTargetUserIds.length === 0) {
      alert("Không có người dùng nào trong danh sách đang online");
      return;
    }

    // Gửi lời mời đến từng người dùng
    validTargetUserIds.forEach((targetUserId) => {
      socket.emit("send-room-invitation", {
        targetUserId,
        roomId,
        callType: "group-call",
      });
    });
    navigate(`/room/${roomId}?type=group-call`);
  };

  useEffect(() => {
    socket.on("online-users", (users) => {
      setOnlineUsers(users.filter((id) => id !== user.id));
    });

    socket.on("receive-room-invitation", ({ roomId, callType }) => {
      alert(`Bạn nhận được lời mời tham gia một cuộc gọi. Room ID: ${roomId}`);
      navigate(`/room/${roomId}?type=${callType}`);
    });

    return () => {
      socket.off("online-users");
      socket.off("receive-room-invitation");
    };
  }, [navigate, user.id]);

  console.log("Online users:", onlineUsers);

  return (
    <>
      <style>{`
        .homepage-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background-color: #f0f8ff;
          font-family: Arial, sans-serif;
        }

        .homepage-content {
          text-align: center;
        }

        .homepage-title {
          font-size: 36px;
          margin-bottom: 10px;
          color: #333;
        }

        .homepage-subtitle {
          font-size: 16px;
          margin-bottom: 20px;
          color: #555;
        }

        .room-id-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 20px;
        }

        .room-id-input {
          padding: 10px;
          margin-right: 5px;
          border: 1px solid #ccc;
          border-radius: 5px;
          width: 220px;
          font-size: 16px;
          text-align: center;
        }

        .generate-button {
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .generate-button:hover {
          background-color: #0056b3;
        }

        .call-buttons {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }

        .call-button {
          padding: 15px 30px;
          margin: 0 10px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 18px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .call-button:hover {
          background-color: #0056b3;
        }

        .call-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .note {
          font-size: 14px;
          color: #888;
          margin-top: 20px;
        }
      `}</style>
      <ToastContainer />
      <div className="homepage-container">
        <div className="homepage-content">
          <h1 className="homepage-title">Chào mừng đến Video Call</h1>
          <p className="homepage-subtitle">
            Bắt đầu cuộc gọi video với ID phòng được tạo ngẫu nhiên
          </p>
          <div className="room-id-container">
            <input
              type="text"
              className="room-id-input"
              placeholder="Generated Room ID"
              value={roomId}
              readOnly
            />
            <button className="generate-button" onClick={handleRoomIdGenerate}>
              Random
            </button>
          </div>
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel>Chọn người muốn gọi</InputLabel>
            <Select
              multiple // Cho phép chọn nhiều người
              value={targetUserIds}
              onChange={(e) => setTargetUserIds(e.target.value)}
              label="Chọn người muốn gọi"
              renderValue={(selected) =>
                selected.map((id) => `user ${id}`).join(", ")
              } // Hiển thị danh sách người được chọn
            >
              {onlineUsers.map((userId) => (
                <MenuItem key={userId} value={userId}>
                  user {userId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className="call-buttons">
            <button
              className="call-button"
              onClick={handleOneAndOneCall}
              disabled={!roomId || targetUserIds.length !== 1}
            >
              Gọi trực tiếp
            </button>
            <button
              className="call-button"
              onClick={handleGroupCall}
              disabled={!roomId || targetUserIds.length === 0}
            >
              Gọi nhóm
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Call;
