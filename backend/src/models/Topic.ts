import mongoose, { Document, Schema } from 'mongoose';

export interface ITopic extends Document {
  slug: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  icon: string;
  color: string;
  category: string;
  min_age: number;
  max_age: number;
  position: number;
  is_free: boolean;
  created_at: Date;
}

const TopicSchema = new Schema<ITopic>({
  slug: { type: String, required: true, unique: true },
  title_en: { type: String, required: true },
  title_ar: { type: String, required: true },
  description_en: { type: String, required: true },
  description_ar: { type: String, required: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  category: { type: String, required: true },
  min_age: { type: Number, required: true, min: 1 },
  max_age: { type: Number, required: true, min: 1 },
  position: { type: Number, required: true, min: 1 },
  is_free: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<ITopic>('Topic', TopicSchema);
