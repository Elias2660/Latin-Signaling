import { Schema, model, models, Document, Model, Types } from "mongoose";

const RoomSchema = new Schema({
  name: {
    type: String,
    unique: [true, "Name already exists"],
    required: [true, "Please provide a name"],
  },
  login_code: {
    type: String,
    required: [true, "Please provide a login code"],
    unique: [true, "Login code already exists"],
  },
  members: {
    type: [Types.ObjectId],
    ref: "User",
    default: [],
  },
  teams: {
    type: [String],
    default: [],
  },
  admin: {
    type: [String],
    required: [true, "Please provide an admin"],
  },
  locked: {
    type: Boolean,
    default: false,
  },
  pings: {
    type: [Object],
    default: [],
  }
});

const Room = models.Room || model("Room", RoomSchema);
export default Room;
