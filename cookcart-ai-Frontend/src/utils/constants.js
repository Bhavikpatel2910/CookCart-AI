export const BRAND = {
  name: 'CookCart AI',
  tagline: 'Blinkit Personal Chef',
  deliveryTime: '10 minutes',
  phone: '+91 98765 43210',
  email: 'hello@cookcart.ai',
  address: 'Sector 62, Noida, Uttar Pradesh 201309',
}

export const NAV_LINKS = [
  { id: 'home', label: 'Home', to: '/' },
  { id: 'categories', label: 'Categories', to: '/recipes' },
  { id: 'chef', label: 'AI Chef', to: '/chef' },
  { id: 'recipes', label: 'Recipes', to: '/recipes' },
]

export const CATEGORIES = [
  { id: 'vegetables', name: 'Vegetables', bg: 'bg-tomato-bg' },
  { id: 'dairy', name: 'Dairy & Bread', bg: 'bg-cheese-bg' },
  { id: 'greens', name: 'Fresh Greens', bg: 'bg-capsicum-bg' },
  { id: 'munchies', name: 'Munchies', bg: 'bg-surface-container-low' },
  { id: 'fruits', name: 'Fresh Fruits', bg: 'bg-surface-soft' },
  { id: 'spices', name: 'Spices & Masalas', bg: 'bg-tomato-bg' },
]

export const FILTERS = ['Veg', 'Jain', 'Under 30 min', 'High Protein']

export const STATS = [
  { value: '1200+', label: 'Recipes' },
  { value: '10 min', label: 'Delivery' },
  { value: '4.9★', label: 'Chef Rating' },
  { value: '2M+', label: 'Home Cooks' },
]

export const CURRENCY = '₹'

export const DELIVERY_FEE = 0
export const EXPRESS_DELIVERY_FEE = 29
export const PACKAGING_FEE = 12
export const DISCOUNT_LABEL = 'Pantry Savings'

export const CHEF_PROMPTS = {
  suggestions: [
    'Paneer butter masala for 4',
    'Something quick under 20 min',
    'A high-protein veg dinner',
  ],
  response: (recipeName, diet) =>
    `Great pick! I recommend starting with ${recipeName} — it's a ${diet.toLowerCase()} favourite that pairs perfectly with your kitchen setup. I can prep the ingredients, adjust servings, and guide you step by step. What serving size would you like?`,
}