import mongoose, { Document, Schema } from 'mongoose';

export interface ILetter extends Document {
  letter: string;
  name_en: string;
  name_ar: string;
  audio_url: string;
  svg_path: string;
  position: number;
  forms: {
    isolated: string;
    initial: string;
    medial: string;
    final: string;
  };
  created_at: Date;
}

const LetterSchema = new Schema<ILetter>({
  letter: { type: String, required: true, unique: true },
  name_en: { type: String, required: true },
  name_ar: { type: String, required: true },
  audio_url: { type: String, default: '' },
  svg_path: { type: String, default: '' },
  position: { type: Number, required: true, min: 1, max: 28 },
  forms: {
    isolated: { type: String, required: true },
    initial: { type: String, required: true },
    medial: { type: String, required: true },
    final: { type: String, required: true },
  },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<ILetter>('Letter', LetterSchema);
