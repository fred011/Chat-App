import User from "../models/user.model.js";
import Message from "../models/message.model.js";
// import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io, userSocketMap } from "../lib/socket.js";
import { uploadImage } from "../lib/uploadThing.js";

export const getUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUser = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUser);
  } catch (error) {
    console.log("Error in getUsers controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload image using UploadThing
      const uploadRes = await uploadImage.onUploadComplete({
        file: { url: image },
      });

      if (uploadRes && uploadRes.url) {
        imageUrl = uploadRes.url; // Assign the uploaded image URL
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteForEveryone } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const senderSocketId = userSocketMap[message.senderId];
    const receiverSocketId = getReceiverSocketId(message.receiverId);

    if (deleteForEveryone) {
      // Only the sender can delete the message for everyone
      if (message.senderId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Delete the message from the database for everyone
      await Message.findByIdAndDelete(messageId);

      // Emit the messageDeleted event to both sender and receiver
      const userIds = [message.senderId, message.receiverId];
      io.emit("messageDeleted", { messageId, deleteForEveryone, userIds });

      return res.json({ message: "Message deleted for everyone" });
    } else {
      return res.status(400).json({ message: "Delete for everyone only" });
    }
  } catch (error) {
    console.log("Error in deleteMessage controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
