import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IParent extends Document {
  email: string;
  password_hash: string;
  children: mongoose.Types.ObjectId[];
  created_at: Date;
  comparePassword(password: string): Promise<boolean>;
}

const ParentSchema = new Schema<IParent>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password_hash: { type: String, required: true },
  children: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  created_at: { type: Date, default: Date.now },
});

// Hash password before saving
ParentSchema.pre('save', async function (next) {
  if (!this.isModified('password_hash')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
  next();
});

ParentSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password_hash);
};

export default mongoose.model<IParent>('Parent', ParentSchema);
