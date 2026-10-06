import mongoose from "mongoose";
const { Schema } = mongoose;

// A synced copy of the signed-in user's profile plus the data we persist for
// them (cart + favourites), so it follows them across browsers/devices.
const UserSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    avatar: { type: String, default: "" },
    provider: { type: String, default: "credentials" },
    cart: { type: [Schema.Types.Mixed], default: [] },
    favorites: { type: [String], default: [] },
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("User", UserSchema);
