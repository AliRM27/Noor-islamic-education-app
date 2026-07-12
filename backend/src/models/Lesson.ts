import mongoose, { Document, Schema } from 'mongoose';
import './Letter'; // Ensure Letter schema is registered for populate
import './Dua'; // Ensure Dua schema is registered for populate
import './Topic'; // Ensure Topic schema is registered for populate

export type ExerciseType =
  | 'listen_tap' | 'match_name' | 'tracing' | 'tap_letter'
  | 'listen_repeat' | 'meaning_match' | 'word_order';

export interface IExercise {
  type: ExerciseType;
  order: number;
}

export interface ILesson extends Document {
  topic_id: mongoose.Types.ObjectId;
  letter_id?: mongoose.Types.ObjectId;
  dua_id?: mongoose.Types.ObjectId;
  title_en: string;
  title_ar: string;
  title_de: string;
  position: number;
  exercises: IExercise[];
  is_free: boolean;
  created_at: Date;
}

const ExerciseSchema = new Schema<IExercise>({
  type: {
    type: String,
    enum: [
      'listen_tap', 'match_name', 'tracing', 'tap_letter',
      'listen_repeat', 'meaning_match', 'word_order',
    ],
    required: true,
  },
  order: { type: Number, required: true },
});

const LessonSchema = new Schema<ILesson>({
  topic_id: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  letter_id: { type: Schema.Types.ObjectId, ref: 'Letter', required: false },
  dua_id: { type: Schema.Types.ObjectId, ref: 'Dua', required: false },
  title_en: { type: String, required: true },
  title_ar: { type: String, required: true },
  title_de: { type: String, required: true },
  position: { type: Number, required: true, min: 1 },
  exercises: [ExerciseSchema],
  // Position within topic determines free/premium gating (e.g. first 5 free)
  is_free: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<ILesson>('Lesson', LessonSchema);
