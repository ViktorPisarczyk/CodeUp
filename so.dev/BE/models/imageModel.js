import { Schema, model } from "mongoose";

const imageSchema = new Schema({
  imageUrl: String,
});

export const Image = model("Image", imageSchema);
