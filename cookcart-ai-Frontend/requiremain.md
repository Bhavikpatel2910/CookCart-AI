# CookCart AI Frontend Requirements

This document is the working requirement list for the CookCart AI frontend.

## Product Goal

CookCart AI should provide a complete recipe-to-cart cooking journey:

1. Discover a recipe.
2. Review required ingredients.
3. Match ingredients to available grocery products.
4. Customize pantry and substitution choices.
5. Add missing items to cart.
6. Checkout.
7. Track delivery.
8. Cook with guided instructions.

## Functional Requirements

### Recipe Discovery

- Users can open the home page and recipe listing without errors.
- Users can search recipes and ingredients.
- Recipe result cards show real food imagery, titles, metadata, and useful navigation.
- Recipe detail pages are available at both `/recipe/:slug` and `/recipes/:slug`.

### Ingredient Review

- `/ingredients` must work when opened directly.
- When no recipe is already selected, `/ingredients` selects a default recipe.
- Recipe-specific ingredient review pages must work at:
  - `/ingredients/:slug`
  - `/recipe/:slug/ingredients`
  - `/recipes/:slug/ingredients`
- Ingredient cards show availability, quantity, unit, product match, and image.
- The page must not fail because of missing optional dataset files.

### Pantry And Substitutions

- Users can review pantry items before adding products to cart.
- Pantry and substitution state must use the shared recipe and dataset contexts.
- The UI should make selected, missing, and available items clear.

### Cart And Checkout

- Users can add recipe-linked grocery products to cart.
- Cart totals must be calculated from product data.
- Checkout must remain guarded when the cart is empty.
- Checkout and tracking screens should use dataset-backed order or mock display data.

### Cooking Mode

- Users can open cooking mode from a selected recipe.
- Cooking steps should be readable and ordered.
- The route must support both default selected recipe state and recipe slugs.

### Dataset Loading

- Dataset data must load from `public/dataset`.
- Required files:
  - `recipes.json`
  - `ingredients.json`
  - `products.json`
- Optional files must default safely when missing or empty.
- Dataset parsing must reject non-JSON responses with a useful error.
- The app must never parse Vite HTML fallback pages as JSON.

### Images

- Product, ingredient, and recipe imagery must use real remote food images.
- Removed local image flows must stay removed:
  - Food11/Kaggle image setup
  - `/dataset/kaggle`
  - `/dataset/images`
  - `/images/recipes`
  - `/images/products`
  - generated SKU SVG placeholders
- Image fallback behavior must be handled centrally.

### Routing

- Browser refresh must work for app routes under Vite.
- Unknown routes should render the not-found page.
- Route guards should redirect or recover gracefully instead of showing broken blank pages.

### UX Requirements

- The app must not show blank pages during normal route navigation.
- Loading states must appear while dataset-backed pages are waiting.
- Error states must be readable and actionable.
- Food and ingredient pages must show images with stable card layouts.
- Mobile and desktop layouts must avoid overlapping text and broken cards.

## Non-Functional Requirements

- Keep the app as a frontend-only Vite React project unless backend work is explicitly requested.
- Avoid reintroducing Create React App commands or documentation.
- Keep mock data deterministic and local to `public/dataset`.
- Keep image URL mapping centralized.
- Keep ESLint errors at zero.
- Production build must complete successfully.

## Acceptance Checks

Run:

```bash
npm run build
npm run lint
```

Expected result:

- Build completes.
- Lint has no errors. Existing fast-refresh warnings in context files are acceptable unless the task is to clean warnings.

Manual browser checks:

- `/` loads.
- `/recipes` loads recipes.
- `/ingredients` opens a working ingredient review page.
- `/recipe/paneer-butter-masala/ingredients` opens the same recipe ingredient review flow.
- `/cart` opens without crashing.
- Browser console has no dataset JSON parse errors.

## Current Data Contract

The frontend expects recipe, ingredient, and product entities to expose normalized fields such as:

- `recipe_id`
- `slug`
- `title`
- `ingredient_id`
- `sku_id`
- `name`
- `unit`
- `quantity`
- `price`
- `image_url`

Legacy camelCase source fields may be normalized by `src/api/datasetApi.js`, but page and service code should consume the normalized shape.

## Maintenance Notes

- Update `README.md` when setup commands, routes, or dataset behavior changes.
- Update this requirements file when app behavior changes.
- Validate `public/dataset/*.json` after any script or manual dataset edit.
- Do not commit dev-server logs or generated build output unless the release process explicitly requires it.
