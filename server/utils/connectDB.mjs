import mongoose from "mongoose";

export default async function () {
  mongoose.connect(process.env.MONGO_URL);
}
