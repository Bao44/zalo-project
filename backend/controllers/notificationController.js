const notificationService = require("../services/notificationService");

const notificationController = {
  async createNotification(req, res) {
    try {
      const notification = req.body;
      console.log("Notification data: ", notification);

      // Basic validation
      if (
        !notification.receiverId ||
        !notification.senderId ||
        !notification.type
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: receiverId, senderId, or type",
        });
      }

      const { data, error } = await notificationService.createNotification(
        notification
      );

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res.status(201).json({
        success: true,
        data,
        message: "Notification created successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error: " + error.message,
      });
    }
  },

  async fetchNotifications(req, res) {
    try {
      const { receiverId } = req.params;

      // Validate receiverId
      if (!receiverId) {
        return res.status(400).json({
          success: false,
          message: "Missing receiverId",
        });
      }

      const { data, error } = await notificationService.fetchNotifications(
        receiverId
      );

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res.status(200).json({
        success: true,
        data,
        message: "Notifications fetched successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error: " + error.message,
      });
    }
  },
};

module.exports = notificationController;
