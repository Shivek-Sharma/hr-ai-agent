import mongoose from "mongoose";

export const connectMongoDB = (url) => {
  mongoose.set("strictQuery", true);

  mongoose
    .connect(url)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error(err));
};
