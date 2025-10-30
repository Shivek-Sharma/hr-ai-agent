import { Schema, model } from "mongoose";

const policySchema = new Schema(
  {
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

    sourceUrl: {
      type: String,
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const policyModel = model("Policy", policySchema);

export default policyModel;
