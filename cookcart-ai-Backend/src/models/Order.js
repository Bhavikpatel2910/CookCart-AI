import mongoose from "mongoose";
const { Schema } = mongoose;

const OrderItemSchema = new Schema(
  {
    skuId: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String },
    image: { type: String },
    packSize: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    recipeId: { type: String },
    recipeName: { type: String, default: "Grocery order" },
    recipeSlug: { type: String },
    recipeImage: { type: String },
    servings: { type: Number },
    items: { type: [OrderItemSchema], validate: (v) => v.length > 0 },
    pricing: {
      subtotal: { type: Number, default: 0 },
      pantrySavings: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      packagingFee: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    delivery: {
      method: { type: String, default: "standard" },
      etaMinutes: { type: Number },
    },
    payment: { method: { type: String, default: "cod" } },
    address: { name: String, phone: String, line1: String, line2: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
      default: "confirmed",
    },
    // Real server-side timestamp of when the order was placed.
    placedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

export default mongoose.model("Order", OrderSchema);
