import mongoose, { Document, Schema } from 'mongoose';

export type ShopCategory = 'hat' | 'background' | 'color' | 'accessory';

export interface IShopItem extends Document {
  name_en: string;
  image_url: string;
  cost: number;
  category: ShopCategory;
  is_premium_only: boolean;
  created_at: Date;
}

const ShopItemSchema = new Schema<IShopItem>({
  name_en: { type: String, required: true },
  image_url: { type: String, default: '' },
  cost: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    enum: ['hat', 'background', 'color', 'accessory'],
    required: true,
  },
  is_premium_only: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<IShopItem>('ShopItem', ShopItemSchema);
