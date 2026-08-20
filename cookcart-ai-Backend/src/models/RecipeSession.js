import mongoose from 'mongoose';
const { Schema } = mongoose;

const SessionIngredientSchema = new Schema({
  ingredientId: { type: Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  name: { type: String, required: true },
  requiredQuantity: { type: Number, required: true },
  unit: { type: String, required: true },
  required: { type: Boolean, default: true }
}, { _id: false });

const SelectedSKUSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true }
}, { _id: false });

const SubstitutionSchema = new Schema({
  ingredientId: { type: Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  originalProductId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  substitutedProductId: { type: Schema.Types.ObjectId, ref: 'Product', required: true }
}, { _id: false });

const RecipeSessionSchema = new Schema({
  userId: { type: String, required: true },
  recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
  servings: { type: Number, required: true },
  ingredients: [SessionIngredientSchema],
  removedIngredients: [{ type: Schema.Types.ObjectId, ref: 'Ingredient' }],
  selectedSKUs: [SelectedSKUSchema],
  substitutions: [SubstitutionSchema],
  estimatedTotal: { type: Number, required: true, default: 0 },
  feasible: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model('RecipeSession', RecipeSessionSchema);
