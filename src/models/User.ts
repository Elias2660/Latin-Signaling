import { Schema, model, models, Document } from "mongoose";

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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  hosted_rooms: {
    type: [String],
    default: [],
  },
});

const User = models.User || model("User", UserSchema);
export default User;
