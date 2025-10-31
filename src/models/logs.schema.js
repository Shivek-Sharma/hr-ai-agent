import { Schema, model } from "mongoose";

const logSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
    },

    isDuplicate: {
      type: Boolean,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    sourceName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const logModel = model("Log", logSchema);

export default logModel;
