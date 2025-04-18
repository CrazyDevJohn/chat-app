import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const con = await mongoose.connect(process.env.MONGODB_API_URL);
    console.log("Mongodb Connected:  " + con.connection.host);
  } catch (err) {
    console.log("Mongodb Connection Error: " + err);
  }
};
