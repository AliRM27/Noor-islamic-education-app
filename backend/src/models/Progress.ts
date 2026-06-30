import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
  user_id: mongoose.Types.ObjectId;
  lesson_id: mongoose.Types.ObjectId;
  stars: number;
  accuracy_pct: number;
  completed_at: Date;
  time_spent_seconds: number;
  attempt_number: number;
}

const ProgressSchema = new Schema<IProgress>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lesson_id: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  stars: { type: Number, min: 1, max: 3, required: true },
  accuracy_pct: { type: Number, min: 0, max: 100, required: true },
  completed_at: { type: Date, default: Date.now },
  time_spent_seconds: { type: Number, min: 0, default: 0 },
  attempt_number: { type: Number, min: 1, default: 1 },
});

// Index for fast user progress queries
ProgressSchema.index({ user_id: 1, lesson_id: 1 });
ProgressSchema.index({ user_id: 1, completed_at: -1 });

export default mongoose.model<IProgress>('Progress', ProgressSchema);
