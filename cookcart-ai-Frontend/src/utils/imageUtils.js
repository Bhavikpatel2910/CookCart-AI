// Centralized remote image resolution. Legacy local paths are ignored because
// deleted image folders are not part of the frontend distribution.
const UNSPLASH = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=82`;

const IMAGE_MAP = {
  'paneer butter masala': UNSPLASH('photo-1601050690597-df0568f70950'),
  'shahi paneer': UNSPLASH('photo-1585937421612-70a008356fbe'),
  'palak paneer': UNSPLASH('photo-1601050690117-94f5f6fa8bd7'),
  'kadai paneer': UNSPLASH('photo-1565557623262-b51c2513a641'),
  'dal makhani': UNSPLASH('photo-1546833999-b9f581a1996d'),
  chole: UNSPLASH('photo-1512621776951-a57141f2eefd'),
  'pav bhaji': UNSPLASH('photo-1603133872878-684f208fb84b'),
  poha: UNSPLASH('photo-1596797038530-2c107229654b'),
  samosa: UNSPLASH('photo-1601050690597-df0568f70950'),
  biryani: UNSPLASH('photo-1563379091339-03246963d51a'),
  'rajma masala': UNSPLASH('photo-1547592180-85f173990554'),
  'aloo gobi': UNSPLASH('photo-1574484284002-952d92456975'),
  'masala dosa': UNSPLASH('photo-1630383249896-424e482df921'),
  dhokla: UNSPLASH('photo-1601050690597-df0568f70950'),
  kadhi: UNSPLASH('photo-1585937421612-70a008356fbe'),
  paneer: UNSPLASH('photo-1628088062854-d1870b4553da'),
  tomato: UNSPLASH('photo-1546094096-0df4bcaaa337'),
  onion: UNSPLASH('photo-1518977676601-b53f82aba655'),
  potato: UNSPLASH('photo-1518977676601-b53f82aba655'),
  butter: UNSPLASH('photo-1589985270826-4b7bb135bc9d'),
  garlic: UNSPLASH('photo-1540148426945-6cf22a6b2383'),
  ginger: UNSPLASH('photo-1615485500704-8e990f9900f7'),
  cumin: UNSPLASH('photo-1596040033229-a9821ebd058d'),
  turmeric: UNSPLASH('photo-1615485290382-441e4d049cb5'),
  chilli: UNSPLASH('photo-1588252303782-cb80119abd6d'),
  rice: UNSPLASH('photo-1536304993881-ff6e9eefa2a6'),
  milk: UNSPLASH('photo-1550583724-b2692b85b150'),
  cream: UNSPLASH('photo-1551024506-0bccd828d307'),
  coriander: UNSPLASH('photo-1535189487909-a262ad10c628'),
};

const FALLBACK_RECIPE = UNSPLASH('photo-1547592180-85f173990554');
const FALLBACK_PRODUCT = UNSPLASH('photo-1606787366850-de6330128bfc');
const FALLBACK_INGREDIENT = UNSPLASH('photo-1542838132-92c53300491e');

function isRemoteUrl(value) {
  return typeof value === 'string' && /^https:\/\//i.test(value);
}

function entityText(entity) {
  if (!entity || typeof entity !== 'object') return String(entity || '').toLowerCase();
  return [entity.name, entity.display_name, entity.canonical_name, entity.product_name,
    entity.ingredient_name, entity.category, entity.dish_category, entity.cuisine]
    .filter(Boolean).join(' ').toLowerCase();
}

function mappedImage(entity, fallback) {
  const text = entityText(entity);
  const key = Object.keys(IMAGE_MAP).find((candidate) => text.includes(candidate));
  return (key && IMAGE_MAP[key]) || fallback;
}

export function resolveImageUrl(value, fallback = FALLBACK_RECIPE) {
  if (isRemoteUrl(value)) return value;
  if (value && typeof value === 'object') {
    if (isRemoteUrl(value.imageUrl)) return value.imageUrl;
    if (isRemoteUrl(value.image)) return value.image;
  }
  return mappedImage(value, fallback);
}

export function getRecipeImageUrl(recipe) { return resolveImageUrl(recipe, FALLBACK_RECIPE); }
export function getProductImageUrl(product) { return resolveImageUrl(product, FALLBACK_PRODUCT); }
export function getIngredientImageUrl(ingredient, product) {
  return product ? resolveImageUrl(product, mappedImage(ingredient, FALLBACK_INGREDIENT))
    : resolveImageUrl(ingredient, FALLBACK_INGREDIENT);
}
export const getRecipeImage = getRecipeImageUrl;
export const getProductImage = getProductImageUrl;
export const getIngredientImage = getIngredientImageUrl;
export function getFallbackRecipeImage() { return FALLBACK_RECIPE; }
export function getFallbackProductImage() { return FALLBACK_PRODUCT; }
export function getFallbackIngredientImage() { return FALLBACK_INGREDIENT; }

export function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}
export function preloadImages(urls) { return Promise.allSettled(urls.map(preloadImage)); }
