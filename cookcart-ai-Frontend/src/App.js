import { motion } from 'framer-motion';
import { ChefHat, Clock3, Flame, Leaf, MapPin, Minus, Plus, Search, ShoppingBag, Sparkles, Star, Truck, X } from 'lucide-react';
import { createContext, useContext, useState } from 'react';
import './App.css';
import './ChefTips.css';
import './index.css';
import { getRecipeImageUrl } from './utils/imageUtils.js';

const heroFood = getRecipeImageUrl({ name: 'Paneer Butter Masala' });

const ingredients = [
  { name: 'Paneer', amount: 200, unit: 'g', price: 92, color: '#fff0c9', emoji: '🧀' },
  { name: 'Tomatoes', amount: 4, unit: 'pcs', price: 24, color: '#ffddd4', emoji: '🍅' },
  { name: 'Butter', amount: 100, unit: 'g', price: 56, color: '#fff4bf', emoji: '🧈' },
  { name: 'Fresh Cream', amount: 50, unit: 'ml', price: 48, color: '#fff0ed', emoji: '🥛' },
  { name: 'Capsicum', amount: 1, unit: 'pc', price: 18, color: '#dff3c5', emoji: '🫑' },
  { name: 'Kashmiri Chilli', amount: 10, unit: 'g', price: 12, color: '#ffe0df', emoji: '🌶️', missing: true, alternative: 'Use paprika for a milder warmth' },
];
const steps = [
  ['Prep your base', 'Dice tomatoes, capsicum and paneer. Keep the butter at room temperature.', '8 min'],
  ['Build the masala', 'Sauté tomatoes in butter until soft. Blend smooth with soaked cashews and spices.', '12 min'],
  ['Bring it together', 'Simmer the gravy with cream, then fold in paneer and capsicum gently.', '10 min'],
  ['Finish & serve', 'Top with a butter curl, crushed kasuri methi and coriander. Serve with warm naan.', '3 min'],
];

const CookCartContext = createContext();
const useCookCart = () => useContext(CookCartContext);

function CookCartProvider({ children }) {
  const [servings, setServings] = useState(2);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const add = (item) => setCart((items) => items.some((x) => x.name === item.name) ? items.map((x) => x.name === item.name ? { ...x, qty: x.qty + 1 } : x) : [...items, { ...item, qty: 1 }]);
  const remove = (name) => setCart((items) => items.filter((x) => x.name !== name));
  return <CookCartContext.Provider value={{ servings, setServings, cart, add, remove, search, setSearch }}>{children}</CookCartContext.Provider>;
}

function Navbar() { const { cart } = useCookCart(); return <nav className="navbar"><a className="brand" href="#top"><span><ChefHat size={21}/></span>CookCart <i>AI</i></a><div className="nav-links"><a href="#recipe">How it works</a><a href="#ingredients">Ingredients</a><button className="cart-pill"><ShoppingBag size={17}/>{cart.length ? cart.length : 'Cart'}</button></div></nav>; }
function SearchBar() { const { search, setSearch } = useCookCart(); const go = () => document.querySelector('#recipe')?.scrollIntoView({ behavior: 'smooth' }); return <div className="search-wrap"><Search size={21}/><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()} placeholder="What would you like to cook today?"/><button onClick={go}>Create recipe <Sparkles size={17}/></button></div>; }
function Hero() { return <section id="top" className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(18,27,21,.9) 0%, rgba(18,27,21,.72) 42%, rgba(18,27,21,.12) 100%), url(${heroFood})` }}><Navbar/><div className="hero-content"><motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.6}}><p className="eyebrow light"><Sparkles size={15}/> YOUR PERSONAL AI CHEF</p><h1>From craving to<br/><em>cooking</em> in minutes.</h1><p className="hero-copy">Tell CookCart what you're hungry for. We turn it into a delicious recipe and a perfectly measured cart.</p><SearchBar/><div className="quick-searches"><span>Try:</span>{['Paneer Butter Masala','Biryani','Pizza','Dosa','Pasta'].map((x) => <button key={x}>{x}</button>)}</div></motion.div></div><div className="hero-trust"><div><Star size={16} fill="currentColor"/> <b>4.9</b> loved by home cooks</div><div><Truck size={17}/> Groceries in 10 mins</div></div></section>; }
function ServingSelector(){const {servings,setServings}=useCookCart();return <div className="serving"><button onClick={()=>setServings(Math.max(1,servings-1))}><Minus size={16}/></button><span><b>{servings}</b> People</span><button onClick={()=>setServings(servings+1)}><Plus size={16}/></button></div>}
function RecipeCard(){return <section id="recipe" className="recipe-card section-card"><div className="recipe-image"><img src={heroFood} alt="Paneer butter masala"/><span><Flame size={15}/> Popular tonight</span></div><div className="recipe-info"><p className="eyebrow"><Sparkles size={14}/> AI-CURATED FOR YOU</p><h2>Paneer Butter Masala</h2><p className="muted">Restaurant-style paneer in a velvety tomato, butter and cream curry. Comfort food, made beautifully simple.</p><div className="meta"><span><Clock3/> 33 mins</span><span><Flame/> Medium</span><span><Leaf/> 480 kcal</span><span><MapPin/> North Indian</span></div><div className="recipe-bottom"><ServingSelector/><button className="save-btn">♡ Save recipe</button></div></div></section>}
function IngredientCard({item}){const {servings,add,cart}=useCookCart();const scale=(item.amount*servings)/2;const display=Number.isInteger(scale)?scale:scale.toFixed(1);const inCart=cart.find((x)=>x.name===item.name);return <motion.article whileHover={{y:-5}} className={`ingredient-card ${item.missing?'is-missing':''}`}><div className="ingredient-visual" style={{background:item.color}}><span>{item.emoji}</span>{item.missing&&<small>Unavailable</small>}</div><div className="ingredient-detail"><h3>{item.name}</h3><p>{display} {item.unit}</p><strong>₹{item.price}</strong></div><button className={inCart?'added':''} disabled={item.missing} onClick={()=>add(item)}>{inCart ? `Added · ${inCart.qty}` : item.missing ? 'Notify me' : 'Add'}</button></motion.article>}
function IngredientsGrid(){const {add}=useCookCart(); return <section id="ingredients" className="ingredients-section"><div className="section-heading"><div><p className="eyebrow">SHOP THE RECIPE</p><h2>Everything you need, <em>exactly measured.</em></h2><p className="muted">Quantities adjust automatically with your serving size.</p></div><button className="primary-btn" onClick={()=>ingredients.filter(x=>!x.missing).forEach(add)}><ShoppingBag size={18}/> Add everything</button></div><div className="ingredients-grid">{ingredients.map((item)=><IngredientCard item={item} key={item.name}/>)}</div></section>}
function RecipeSteps(){return <section className="steps section-card"><div className="section-heading"><div><p className="eyebrow">COOK WITH CONFIDENCE</p><h2>Let’s make magic.</h2></div><span className="time-total"><Clock3 size={17}/> 33 min total</span></div><div className="timeline">{steps.map(([title,text,time],i)=><article className="step" key={title}><div className="step-number">{i+1}</div><div className="step-copy"><span>{time}</span><h3>{title}</h3><p>{text}</p></div>{i===1&&<div className="step-art">🍅<small>velvety<br/>masala</small></div>}</article>)}</div></section>}
function NutritionCard(){return <section className="nutrition section-card"><p className="eyebrow">PER SERVING</p><h3>Wholesome goodness</h3><div>{[['480','Calories'],['19g','Protein'],['31g','Carbs'],['27g','Fat'],['4g','Fiber']].map(([n,l])=><span key={l}><b>{n}</b>{l}</span>)}</div></section>}
function ChefTips(){return <aside className="chef-tips"><div className="chef-icon">✦</div><p className="eyebrow">A NOTE FROM YOUR AI CHEF</p><h3>Small details.<br/>Big flavour.</h3><ul><li>Use room-temperature butter for a silkier gravy.</li><li>Marinate paneer for 15 minutes for extra flavour.</li><li>Kashmiri chilli gives colour, not heat.</li></ul></aside>}
function Missing(){const missing=ingredients.filter(x=>x.missing);return <section className="missing"><p className="eyebrow">PANTRY CHECK</p><h2>You’re <em>missing</em> one thing.</h2>{missing.map(i=><div key={i.name}><span>{i.emoji}</span><p><b>{i.name}</b><small>{i.alternative}</small></p><button>View alternatives →</button></div>)}</section>}
function CartSidebar(){const {cart,remove}=useCookCart();const subtotal=cart.reduce((a,x)=>a+x.price*x.qty,0);const delivery=cart.length?19:0;return <aside className="cart-sidebar"><div className="cart-header"><div><p className="eyebrow">YOUR COOKCART</p><h3>Ready to cook <span>✦</span></h3></div><ShoppingBag/></div>{cart.length===0?<div className="empty-cart"><ShoppingBag/><p>Your recipe essentials will<br/>appear right here.</p></div>:<div className="cart-items">{cart.map(x=><div key={x.name}><span>{x.emoji}</span><p><b>{x.name}</b><small>{x.qty} × ₹{x.price}</small></p><strong>₹{x.qty*x.price}<button onClick={()=>remove(x.name)}><X size={13}/></button></strong></div>)}</div>}<div className="cart-totals"><p><span>Items</span><b>₹{subtotal}</b></p><p><span>Delivery</span><b>{delivery?`₹${delivery}`:'—'}</b></p><p className="saving"><span>Savings</span><b>− ₹{Math.round(subtotal*.12)}</b></p><div><span>Total</span><b>₹{Math.max(0,subtotal+delivery-Math.round(subtotal*.12))}</b></div><button className="checkout">Checkout <span>→</span></button></div></aside>}
function Footer(){return <footer><a className="brand" href="#top"><span><ChefHat size={18}/></span>CookCart <i>AI</i></a><p>Good food begins with a good idea.</p><small>© 2024 CookCart AI · Made for delicious days</small></footer>}
function AppContent(){return <><Hero/><main><div className="content"><RecipeCard/><IngredientsGrid/><RecipeSteps/><div className="lower-grid"><NutritionCard/><ChefTips/></div><Missing/></div><CartSidebar/></main><Footer/></>}
export default function App(){return <CookCartProvider><AppContent/></CookCartProvider>}
