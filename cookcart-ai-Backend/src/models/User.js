import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // allows many docs with no email while still enforcing uniqueness when present
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // allows many docs with no phone while still enforcing uniqueness when present
      trim: true,
    },
    password: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
  },
);

// Async pre-hook: no `next` callback needed/available on this mongoose
// version — just return a promise (or use async/await) and it awaits it.
UserSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toSafeObject = function toSafeObject() {
  return {
    user_id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone || "",
  };
};

export default mongoose.model("User", UserSchema);