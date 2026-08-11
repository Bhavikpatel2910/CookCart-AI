import mongoose from "mongoose";
const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    ingredientId: {
      type: Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },
    packSize: { type: Number, required: true },
    unit: { type: String, required: true },
    price: { type: Number, required: true },
    inventory: { type: Number, required: true, default: 0 },
    image: { type: String },
    category: { type: String },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Product", ProductSchema);
