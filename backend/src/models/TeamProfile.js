import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    skills: {
      type: [String],
      default: [],
    },
  },
  {
    _id: true,
  }
);

const preferencesSchema = new mongoose.Schema(
  {
    softwareOnly: {
      type: Boolean,
      default: false,
    },

    hardwareComfort: {
      type: Number,
      min: 0,
      max: 10,
      default: 5,
    },

    aiMlComfort: {
      type: Number,
      min: 0,
      max: 10,
      default: 5,
    },

    willingnessToLearn: {
      type: Number,
      min: 0,
      max: 10,
      default: 5,
    },
  },
  {
    _id: false,
  }
);

const teamProfileSchema = new mongoose.Schema(
  {
    teamId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    members: {
      type: [teamMemberSchema],
      default: [],
    },

    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

const TeamProfile = mongoose.model(
  "TeamProfile",
  teamProfileSchema
);

export default TeamProfile;