import jwt from "jsonwebtoken";

export const genarateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("CHAT_APP_JWT_TOKEN", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7D MS
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};
