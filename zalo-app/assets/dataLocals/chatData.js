const chatData = [
    {
        id: "chat123",
        isGroup: true,
        name: "Lớp React Native",
        avatar: "https://example.com/group-avatar.png",
        participants: [
            { id: "user1", name: "Nam", avatar: "https://example.com/nam.png" },
            { id: "user2", name: "Hà", avatar: "https://example.com/ha.png" },
            { id: "user3", name: "Minh", avatar: "https://example.com/minh.png" },
        ],
        messages: [
            {
                id: "msg1",
                sender: "user1",
                content: "Chào mọi người!",
                timestamp: "2025-02-15T10:00:00Z",
            },
            {
                id: "msg2",
                sender: "user2",
                content: "Hello Nam!",
                timestamp: "2025-02-15T10:05:00Z",
            },
            {
                id: "msg3",
                sender: "user3",
                content: "Hôm nay học gì đây?",
                timestamp: "2025-02-15T12:28:00Z",
            },
        ],
    },
    {
        id: "chat456",
        isGroup: false,
        name: "Hà Nguyễn",  // Tên người đang chat
        avatar: "https://example.com/ha-avatar.png",
        participants: [
            { id: "user1", name: "Nam", avatar: "https://example.com/nam.png" },
            { id: "user2", name: "Hà Nguyễn", avatar: "https://example.com/ha-avatar.png" }
        ],
        messages: [
            {
                id: "msg1",
                sender: "user1",
                content: "Chào Hà! Hôm nay thế nào?",
                timestamp: "2025-02-15T08:30:00Z",
            },
            {
                id: "msg2",
                sender: "user2",
                content: "Chào Nam! Mình ổn, còn bạn?",
                timestamp: "2025-02-15T08:32:00Z",
            },
            {
                id: "msg3",
                sender: "user1",
                content: "Mình cũng ổn! Cuối tuần có kế hoạch gì chưa?",
                timestamp: "2025-02-15T08:35:00Z",
            },
        ],
    }
];

export default chatData;