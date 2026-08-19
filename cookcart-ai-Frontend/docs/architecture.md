# 🏗️ CookCart AI Architecture

> Blinkit Personal Chef
> System Architecture Document
> Version 1.0

---

# Overview

CookCart AI is an AI-powered Recipe-to-Commerce platform that transforms a user's cooking intent into a ready-to-checkout grocery cart.

Instead of searching individual grocery products, users simply search for a dish.

The system automatically:

- Understands the dish
- Generates a verified recipe
- Calculates ingredient quantities
- Matches ingredients to Blinkit products
- Optimizes pack sizes
- Removes pantry items
- Suggests substitutes
- Adds everything to the cart
- Guides users through cooking

---

# High-Level Architecture

```

┌────────────────────────────────────────────┐
│              React Frontend                │
│                                            │
│ Search │ Recipe │ Ingredients │ Cart │ AI │
└──────────────────┬─────────────────────────┘
│
REST API
│
▼
┌────────────────────────────────────────────┐
│ Express.js Backend API                     │
└──────────────────┬─────────────────────────┘
│
├──────────────┐
│              │
▼              ▼
Recipe Service Product Service
│              │
├──────────────┤
▼
AI Orchestrator
│
├────────────────────────────────────┐
▼                                    ▼
Serving Engine                  Pantry Engine
│                                    │
└──────────────┬─────────────────────┘
│
▼
Recommendation Engine
│
▼
Cart Service
│
▼
MongoDB

```

---

# Technology Stack

## Frontend

React

React Router

Context API

Axios

Framer Motion

Lucide React

CSS Modules / Modern CSS

---

## Backend

Node.js

Express.js

JWT Authentication

REST APIs

---

## Database

MongoDB

Collections

Users

Recipes

Ingredients

Products

Inventory

Pantry

Cart

Orders

Recipe Sessions

---

## AI Layer

Gemini API

or

OpenAI GPT

Responsibilities

Dish Recognition

Recipe Search

Substitutions

Cooking Tips

Personalization

Natural Language Queries

---

# Architecture Layers

## Presentation Layer

Responsible for user interaction.

Contains

Home Page

Recipe Page

Ingredients

Cart

Profile

Authentication

Settings

Cooking Mode

---

## API Layer

Acts as communication bridge.

Responsibilities

Authentication

Recipe APIs

Ingredient APIs

Cart APIs

Pantry APIs

Inventory APIs

User APIs

---

## Business Logic Layer

Contains all application logic.

Modules

Recipe Generator

Serving Calculator

Ingredient Normalizer

SKU Matcher

Recommendation Engine

Pack Optimizer

Cart Builder

Pantry Filter

Cooking Session Manager

---

## AI Layer

Uses LLMs only where intelligence is required.

AI handles

Dish intent

Ingredient alternatives

Recipe explanations

Cooking tips

Recommendations

Never

Quantity calculations

Inventory calculations

Pricing

Pack optimization

Business rules

---

## Data Layer

Stores all persistent data.

Collections

Users

Recipes

Ingredients

Products

Inventory

Orders

Favorites

Pantry

Recipe Sessions

---

# Frontend Architecture

```

src

components/
Navbar
Hero
SearchBar
RecipeCard
IngredientCard
NutritionCard
RecipeSteps
ChefTips
CartSidebar
Footer

pages/
Home
Recipe
Cart
Profile
CookingMode

layouts/
MainLayout

contexts/
CartContext
RecipeContext
UserContext

hooks/
useCart
useRecipe
usePantry

services/
api.js
recipeService.js
cartService.js

utils/
servingCalculator.js
priceCalculator.js

data/
dummyRecipes.js
dummyIngredients.js

assets/

```

---

# Backend Architecture

```

server

controllers/

recipeController

cartController

userController

pantryController

inventoryController

routes/

recipe.routes.js

cart.routes.js

user.routes.js

middlewares/

auth.js

errorHandler.js

validation.js

services/

RecipeService

ServingService

PantryService

InventoryService

AIService

RecommendationService

PackOptimizer

models/

Recipe

Product

Ingredient

Inventory

Cart

Order

User

config/

database.js

gemini.js

jwt.js

```

---

# Core Workflow

## 1. User Search

User searches

Paneer Butter Masala

↓

Frontend sends query

↓

Backend checks

Recipe Database

↓

If recipe exists

↓

Recipe returned

Else

↓

AI understands query

↓

Recipe lookup

---

## 2. Recipe Generation

Recipe loaded

↓

Base Recipe

↓

Serving Engine

↓

Ingredient Scaling

↓

Nutrition Calculation

↓

Cooking Time

↓

Recipe Response

---

## 3. Ingredient Matching

Recipe Ingredients

↓

Normalize Ingredient Names

↓

Search Product Database

↓

Filter Inventory

↓

Rank Products

↓

Optimize Pack Size

↓

Return Best Products

---

# Pack Optimization

Example

Recipe requires

200g Paneer

Inventory

100g

200g

500g

Algorithm chooses

200g Pack

instead of

500g Pack

to reduce waste.

---

# Pantry Flow

User marks

Already Have

↓

Ingredient removed

↓

Price updated

↓

Cart recalculated

↓

Savings shown

---

# Cart Flow

Recipe

↓

Ingredients

↓

Available Products

↓

Price Calculation

↓

Delivery Fee

↓

Discounts

↓

Total

↓

Checkout

---

# Cooking Mode

Order Delivered

↓

Cooking Session Starts

↓

Step-by-Step Guide

↓

Timers

↓

AI Tips

↓

Recipe Completed

---

# Database Schema

## User

```

{
name,
email,
password,
favorites[],
pantry[],
orders[]
}

```

---

## Recipe

```

{
name,
slug,
description,
image,
baseServings,
difficulty,
cookTime,
ingredients[],
steps[],
nutrition
}

```

---

## Ingredient

```

{
name,
aliases[],
unit,
category
}

```

---

## Product

```

{
name,
brand,
price,
inventory,
packSize,
ingredientId,
image
}

```

---

## Pantry

```

{
userId,
ingredientId,
quantity,
updatedAt
}

```

---

# API Endpoints

## Recipes

GET

/api/recipes

GET

/api/recipes/:id

POST

/api/recipes/search

POST

/api/recipes/generate

---

## Cart

POST

/api/cart/add

POST

/api/cart/add-recipe

GET

/api/cart

DELETE

/api/cart/:id

---

## Pantry

GET

/api/pantry

POST

/api/pantry

PATCH

/api/pantry

DELETE

/api/pantry/:id

---

## User

POST

/api/auth/register

POST

/api/auth/login

GET

/api/profile

PATCH

/api/profile

---

# AI Pipeline

```

User Query

↓

Intent Detection

↓

Recipe Retrieval

↓

Serving Engine

↓

Ingredient Normalization

↓

Inventory Check

↓

Pack Optimization

↓

Recommendation Engine

↓

Pantry Removal

↓

Cart Generation

↓

Cooking Assistant

```

---

# Security

JWT Authentication

Password Hashing

HTTPS

Helmet

Rate Limiting

Input Validation

CORS

Environment Variables

Role-based Authorization

---

# Performance

Lazy Loading

Image Optimization

Code Splitting

Memoization

React Query (future)

Pagination

Caching

Compression

CDN Assets

---

# Scalability

Stateless Backend

Horizontal Scaling

Redis Cache

Microservice-ready Architecture

Cloud Storage

Background Workers

API Gateway Support

---

# Future Enhancements

AI Meal Planner

Voice Cooking Assistant

Pantry Detection using Computer Vision

Nutrition Tracking

Family Profiles

Weekly Meal Plans

Recipe Recommendations

Smart Shopping Lists

Regional Recipes

Multi-language Support

Offline Cooking Mode

---

# Deployment

Frontend

Vercel

Backend

Render

Railway

AWS EC2

Database

MongoDB Atlas

Storage

Cloudinary

Monitoring

Sentry

LogRocket

Google Analytics

---

# Design Principles

- AI assists but never replaces deterministic business logic.
- Recipe quantities are always calculated by code, not by an LLM.
- Product recommendations prioritize availability, cost, and minimal waste.
- Every service is modular, reusable, and independently testable.
- The architecture is designed to support future AI capabilities without changing the core commerce workflow.

---

# End-to-End Flow

```

User Searches Dish
        │
        ▼
Recipe Search
        │
        ▼
Serving Calculator
        │
        ▼
Ingredient Generator
        │
        ▼
Product Matching
        │
        ▼
Inventory Check
        │
        ▼
Pack Optimization
        │
        ▼
Pantry Filter
        │
        ▼
Cart Builder
        │
        ▼
Checkout
        │
        ▼
Delivery
        │
        ▼
AI Cooking Assistant

```

---

# Vision

> **"CookCart AI transforms grocery shopping into an intelligent cooking journey, enabling users to move seamlessly from meal inspiration to checkout and finally to cooking, all within a single, AI-powered experience."**
