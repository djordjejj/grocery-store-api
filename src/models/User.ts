import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export type Role = "manager" | "employee";

export interface IUser extends Document {
  username: string;
  password: string;
  role: Role;
  node: mongoose.Types.ObjectId;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["manager", "employee"], required: true },
  node: { type: Schema.Types.ObjectId, ref: "Node", required: true }
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
