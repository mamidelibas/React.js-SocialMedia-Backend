// ? Node modules.
const { mongoose, ObjectId, Schema } = require("mongoose");
const bcrypt = require("bcryptjs");

AutoID = mongoose.Types.ObjectId;

// ? Schema.
const userSchema = new mongoose.Schema(
  {
    id: AutoID,
    name: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    phone: String,
    birthday: Date,
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: false,
      default: "",
    },
    profilePhoto: {
      type: String,
      required: false,
      default: "",
    },
    coverPhoto: {
      type: String,
      required: false,
      default: "",
    },
    publications: [
      {
        type: ObjectId,
        ref: "ProfilePosts",
      },
    ],
    userFollowers: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

module.exports = mongoose.model("User", userSchema, "user");
