import mongoose from "mongoose";

const memberSkillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    proficiency: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 5,
    },
  },
  {
    _id: false,
  }
);

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
      type: [memberSkillSchema],
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

    accessTokenHash: {
      type: String,
      required: true,
      select: false,
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

teamProfileSchema.pre("validate", function normalizeLegacySkills(next) {
  for (const member of this.members) {
    if (!Array.isArray(member.skills)) {
      continue;
    }

    member.skills = member.skills
      .map((skill) => {
        if (typeof skill === "string") {
          return {
            name: skill,
            proficiency: 5,
          };
        }

        return skill;
      })
      .filter(
        (skill) =>
          skill &&
          typeof skill.name === "string" &&
          skill.name.trim()
      );
  }

  next();
});

const TeamProfile = mongoose.model(
  "TeamProfile",
  teamProfileSchema
);

export default TeamProfile;