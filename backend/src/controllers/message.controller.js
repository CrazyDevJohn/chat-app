import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUserForSidbar = async (req, res) => {
  try {
    const loggedInUserid = req.user._id;

    const filterdUsers = await User.find({
      _id: { $ne: loggedInUserid },
    }).select("-password");

    res.status(200).json(filterdUsers);
  } catch (err) {
    console.log("Error in get users for sidbar controller ", err.message);
    res.status(500).json({ message: "Internaal Server Error!" });
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
  } catch (err) {
    console.log("Error in get users for sidbar controller ", err.message);
    res.status(500).json({ message: "Internaal Server Error!" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;

    const senderId = req.user._id;

    let imageUrl;

    if (image) {
      const uploadedImageResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadedImageResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json(newMessage);
  } catch (err) {
    console.log("Error in get sendMessage controller ", err.message);
    res.status(500).json({ message: "Internaal Server Error!" });
  }
};
