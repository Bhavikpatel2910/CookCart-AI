import mongoose from "mongoose";
const { Schema } = mongoose;

const OrderItemSchema = new Schema(
  {
    sku_id: { type: Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unit_price: { type: Number, required: true },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipe_id: { type: Schema.Types.ObjectId, ref: "Recipe" },
    items: { type: [OrderItemSchema], required: true },
    address: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      line1: { type: String, required: true },
      line2: { type: String },
    },
    deliveryMethod: { type: String, enum: ["express", "standard"], default: "standard" },
    paymentMethod: { type: String, enum: ["upi", "card", "cod"], default: "cod" },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true, default: 0 },
    packagingFee: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Order", OrderSchema);
