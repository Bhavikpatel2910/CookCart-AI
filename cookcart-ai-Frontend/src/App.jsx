import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout.jsx'
import Loading from './components/common/Loading.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { RecipeProvider } from './context/RecipeContext.jsx'
import { PantryProvider } from './context/PantryContext.jsx'
import { UserProvider } from './context/UserContext.jsx'
import { AppProvider } from './context/AppContext.jsx'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'
import { RecipeGuard } from './components/common/RecipeGuard.jsx'
import { CartGuard } from './components/common/RecipeGuard.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const Recipes = lazy(() => import('./pages/Recipes.jsx'))
const Chef = lazy(() => import('./pages/Chef.jsx'))
const SearchResults = lazy(() => import('./pages/SearchResults.jsx'))
const RecipeOverview = lazy(() => import('./pages/RecipeOverview.jsx'))
const IngredientReview = lazy(() => import('./pages/IngredientReview.jsx'))
const PantryCustomization = lazy(() => import('./pages/PantryCustomization.jsx'))
const Cart = lazy(() => import('./pages/Cart.jsx'))
const Checkout = lazy(() => import('./pages/Checkout.jsx'))
const DeliveryTracking = lazy(() => import('./pages/DeliveryTracking.jsx'))
const CookingMode = lazy(() => import('./pages/CookingMode.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Signup = lazy(() => import('./pages/Signup.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))
const Favorites = lazy(() => import('./pages/Favorites.jsx'))
const Orders = lazy(() => import('./pages/Orders.jsx'))
const OrderDetails = lazy(() => import('./pages/OrderDetails.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const Help = lazy(() => import('./pages/Help.jsx'))
const Notifications = lazy(() => import('./pages/Notifications.jsx'))

function withSuspense(Component) {
  return (
    <Suspense fallback={<Loading fullPage />}>
      <Component />
    </Suspense>
  )
}

function withRecipeGuard(Component) {
  return withSuspense(() => (
    <RecipeGuard>
      <Component />
    </RecipeGuard>
  ))
}

function withCartGuard(Component) {
  return withSuspense(() => (
    <CartGuard>
      <Component />
    </CartGuard>
  ))
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <AppProvider>
        <AuthProvider>
          <UserProvider>
            <RecipeProvider>
              <CartProvider>
                <PantryProvider>
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={withSuspense(Home)} />
                    <Route path="/recipes" element={withSuspense(Recipes)} />
                    <Route path="/chef" element={withSuspense(Chef)} />
                    <Route path="/search" element={withSuspense(SearchResults)} />
                    <Route path="/search/:query" element={withSuspense(SearchResults)} />
                    <Route path="/recipe/:slug" element={withSuspense(RecipeOverview)} />
                    <Route path="/recipes/:slug" element={withSuspense(RecipeOverview)} />
                    <Route path="/ingredients" element={withRecipeGuard(IngredientReview)} />
                    <Route path="/ingredients/:slug" element={withRecipeGuard(IngredientReview)} />
                    <Route path="/recipe/:slug/ingredients" element={withRecipeGuard(IngredientReview)} />
                    <Route path="/recipes/:slug/ingredients" element={withRecipeGuard(IngredientReview)} />
                    <Route path="/pantry" element={withRecipeGuard(PantryCustomization)} />
                    <Route path="/cart" element={withSuspense(Cart)} />
                    <Route path="/checkout" element={withCartGuard(Checkout)} />
                    <Route path="/tracking" element={withSuspense(DeliveryTracking)} />
                    <Route path="/delivery/:orderId" element={withSuspense(DeliveryTracking)} />
                    <Route path="/cooking" element={withRecipeGuard(CookingMode)} />
                    <Route path="/cooking/:slug" element={withRecipeGuard(CookingMode)} />
                    <Route path="/profile" element={withSuspense(Profile)} />
                    <Route path="/favorites" element={withSuspense(Favorites)} />
                    <Route path="/orders" element={withSuspense(Orders)} />
                    <Route path="/orders/:orderId" element={withSuspense(OrderDetails)} />
                    <Route path="/settings" element={withSuspense(Settings)} />
                    <Route path="/help" element={withSuspense(Help)} />
                    <Route path="/notifications" element={withSuspense(Notifications)} />
                    <Route path="/login" element={withSuspense(Login)} />
                    <Route path="/signup" element={withSuspense(Signup)} />
                    <Route path="*" element={withSuspense(NotFound)} />
                  </Route>
                </Routes>
                <Toaster
                  position="top-center"
                  toastOptions={{
                    style: {
                      background: '#1b1c1c',
                      color: '#fff',
                      borderRadius: '16px',
                      fontSize: '14px',
                    },
                    success: {
                      iconTheme: { primary: '#14C15A', secondary: '#fff' },
                    },
                  }}
                />
</PantryProvider>
              </CartProvider>
            </RecipeProvider>
          </UserProvider>
        </AuthProvider>
      </AppProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
