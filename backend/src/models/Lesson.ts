import mongoose, { Document, Schema } from 'mongoose';
import './Letter'; // Ensure Letter schema is registered for populate

export type ExerciseType = 'listen_tap' | 'match_name' | 'tracing' | 'tap_letter';

export interface IExercise {
  type: ExerciseType;
  order: number;
}

export interface ILesson extends Document {
  letter_id: mongoose.Types.ObjectId;
  title_en: string;
  title_ar: string;
  position: number;
  exercises: IExercise[];
  is_free: boolean;
  created_at: Date;
}

const ExerciseSchema = new Schema<IExercise>({
  type: {
    type: String,
    enum: ['listen_tap', 'match_name', 'tracing', 'tap_letter'],
    required: true,
  },
  order: { type: Number, required: true },
});

const LessonSchema = new Schema<ILesson>({
  letter_id: { type: Schema.Types.ObjectId, ref: 'Letter', required: true },
  title_en: { type: String, required: true },
  title_ar: { type: String, required: true },
  position: { type: Number, required: true, min: 1, max: 28 },
  exercises: [ExerciseSchema],
  // Letters 1–5 are free, 6–28 require premium
  is_free: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<ILesson>('Lesson', LessonSchema);
