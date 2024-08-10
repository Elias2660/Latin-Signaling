import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: {
    type: String,
    unique: [true, "Name already exists"],
    required: [true, "Please provide a name"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: [true, "Email already exists"],
  },
  image: {
    type: String,
  },
  objectList: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  admin: {
    type: Boolean,
    default: false,
  },
});

const User = models.User || model("User", UserSchema);
export default User;