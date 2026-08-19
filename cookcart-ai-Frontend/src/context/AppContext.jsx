import { useEffect, useMemo, useState } from 'react';
import { createContext, useContext } from 'react';
import { loadDataset } from '../api/datasetApi.js';
import { getAllRecipesForListing } from '../services/recipeService.js';
import { getAllUsers } from '../api/userApi.js';
import { getAllIngredients } from '../api/ingredientApi.js';
import { getAllProducts } from '../api/productApi.js';

const AppContext = createContext(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

function AppLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-alt">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-success-veg/20 animate-pulse" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-success-veg border-t-transparent animate-spin" />
        </div>
        <p className="text-label-md text-on-surface-variant">Loading CookCart AI...</p>
      </div>
    </div>
  );
}

function AppError({ error, onRetry }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-alt p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Failed to load data</h2>
        <p className="text-on-surface-variant mb-4">{error}</p>
        <button 
          onClick={onRetry}
          className="px-6 py-3 bg-success-veg text-white rounded-xl font-semibold hover:bg-secondary"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export function AppProvider({ children }) {
  const [datasetLoaded, setDatasetLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [users, setUsers] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [products, setProducts] = useState([]);

  const initialize = async () => {
    try {
      setLoading(true);
      setError(null);
      await loadDataset();
      
      const [recipesData, usersData, ingredientsData, productsData] = await Promise.all([
        getAllRecipesForListing(),
        getAllUsers(),
        getAllIngredients(),
        getAllProducts(),
      ]);
      
      setRecipes(recipesData);
      setUsers(usersData);
      setIngredients(ingredientsData);
      setProducts(productsData);
      setDatasetLoaded(true);
    } catch (err) {
      console.error('Failed to load CookCart mock data:', err);
      setError('We could not load the cooking catalogue. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const value = useMemo(() => ({
    datasetLoaded,
    loading,
    error,
    recipes,
    users,
    ingredients,
    products,
  }), [datasetLoaded, loading, error, recipes, users, ingredients, products]);

  // Always render the provider with the same structure
  // Use a single fragment to maintain consistent hook order
  return (
    <AppContext.Provider value={value}>
      <>
        {loading && <AppLoading />}
        {error && <AppError error={error} onRetry={initialize} />}
        {!loading && !error && children}
      </>
    </AppContext.Provider>
  );
}
