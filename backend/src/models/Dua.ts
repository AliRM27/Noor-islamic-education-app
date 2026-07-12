import mongoose, { Document, Schema } from 'mongoose';

export interface IDua extends Document {
  slug: string;
  title_en: string;
  arabic_text: string;
  transliteration: string;
  translation_en: string;
  translation_de: string;
  occasion_en: string;
  occasion_de: string;
  words: string[];
  audio_url: string;
  position: number;
  created_at: Date;
}

const DuaSchema = new Schema<IDua>({
  slug: { type: String, required: true, unique: true },
  title_en: { type: String, required: true },
  arabic_text: { type: String, required: true },
  transliteration: { type: String, required: true },
  translation_en: { type: String, required: true },
  translation_de: { type: String, required: true },
  occasion_en: { type: String, required: true },
  occasion_de: { type: String, required: true },
  words: [{ type: String, required: true }],
  audio_url: { type: String, default: '' },
  position: { type: Number, required: true, min: 1 },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<IDua>('Dua', DuaSchema);
