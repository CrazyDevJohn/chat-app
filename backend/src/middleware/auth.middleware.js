import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.CHAT_APP_JWT_TOKEN;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - no token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized - token invalid",
      });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }
    req.user = user;

    next();
  } catch (err) {
    console.log("Error in protectRoute : " + err.message);
    res.status(500).json({ message: "Internaal Server Error!" });
  }
};
