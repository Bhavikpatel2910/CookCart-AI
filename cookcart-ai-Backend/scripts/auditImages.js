// Audits seed data for image + referential-integrity problems.
// Usage: npm run audit:images   (exits 1 if any hard problem is found)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const seedDir = path.join(here, "../src/data/seed");
const publicDir = path.join(here, "../../cookcart-ai-Frontend/public");
const read = (f) => JSON.parse(fs.readFileSync(path.join(seedDir, f), "utf8"));

const ingredients = read("ingredients.json");
const products = read("products.json");
const recipes = read("recipes.json");

const problems = [];
const warnings = [];
const isRemote = (u) => /^https?:\/\//i.test(u || "");
const localExists = (u) => u && u.startsWith("/") && fs.existsSync(path.join(publicDir, u));

const ingById = new Map(ingredients.map((i) => [i._id, i]));

for (const i of ingredients) {
  if (!i.image) problems.push(`ingredient ${i._id}: no image`);
  else if (!isRemote(i.image) && !localExists(i.image)) problems.push(`ingredient ${i._id}: file missing ${i.image}`);
}

const shared = new Map();
for (const i of ingredients) shared.set(i.image, [...(shared.get(i.image) || []), i._id]);
for (const [img, ids] of shared) if (ids.length > 1) warnings.push(`shared ingredient image ${img}: ${ids.join(", ")}`);

for (const p of products) {
  if (!ingById.has(p.ingredientId)) problems.push(`product ${p._id}: unknown ingredientId ${p.ingredientId}`);
  if (!p.image) problems.push(`product ${p._id}: no image`);
  else if (!isRemote(p.image) && !localExists(p.image)) problems.push(`product ${p._id}: file missing ${p.image}`);
}
const covered = new Set(products.map((p) => p.ingredientId));
for (const i of ingredients) if (!covered.has(i._id)) problems.push(`ingredient ${i._id}: no product`);

for (const r of recipes) {
  for (const x of r.ingredients || []) {
    if (!ingById.has(x.ingredientId)) problems.push(`recipe ${r._id}: unknown ingredientId ${x.ingredientId}`);
  }
  if (!r.image) warnings.push(`recipe ${r._id} (${r.name}): empty image`);
  else if (isRemote(r.image)) warnings.push(`recipe ${r._id} (${r.name}): hotlinked image ${r.image}`);
  else if (!localExists(r.image)) problems.push(`recipe ${r._id}: file missing ${r.image}`);
}

console.log(`ingredients: ${ingredients.length} | products: ${products.length} | recipes: ${recipes.length}`);
warnings.forEach((w) => console.log("WARN ", w));
problems.forEach((p) => console.log("FAIL ", p));
console.log(problems.length ? `\n${problems.length} problem(s) found` : "\nNo hard problems found");
process.exit(problems.length ? 1 : 0);
