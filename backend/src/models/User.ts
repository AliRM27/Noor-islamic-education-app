import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  display_name: string;
  pin_hash: string;
  age: number;
  avatar: {
    base_id: string;
    unlocked_items: string[];
  };
  coins: number;
  streak: {
    current: number;
    longest: number;
    last_activity_date: Date | null;
  };
  is_premium: boolean;
  parent_id: mongoose.Types.ObjectId | null;
  created_at: Date;
  comparePin(pin: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  display_name: { type: String, required: true, trim: true, maxlength: 30 },
  pin_hash: { type: String, required: true },
  age: { type: Number, min: 1, max: 18, default: 5 },
  avatar: {
    base_id: { type: String, default: 'avatar_1' },
    unlocked_items: [{ type: String }],
  },
  coins: { type: Number, default: 0, min: 0 },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    last_activity_date: { type: Date, default: null },
  },
  is_premium: { type: Boolean, default: false },
  parent_id: { type: Schema.Types.ObjectId, ref: 'Parent', default: null },
  created_at: { type: Date, default: Date.now },
});

// Hash PIN before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('pin_hash')) return next();
  const salt = await bcrypt.genSalt(10);
  this.pin_hash = await bcrypt.hash(this.pin_hash, salt);
  next();
});

UserSchema.methods.comparePin = async function (pin: string): Promise<boolean> {
  return bcrypt.compare(pin, this.pin_hash);
};

export default mongoose.model<IUser>('User', UserSchema);
