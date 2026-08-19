import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  scaleIngredientQuantity,
  calculatePackOptimization,
  calculateMultiplePackOptions,
  getRecommendedPackOption,
} from './src/utils/quantityUtils.js'

const here = path.dirname(fileURLToPath(import.meta.url))
// The shipped frontend owns its mock dataset under public/dataset.  Keep the
// old sibling dataset location as a convenience for dataset-only checkouts.
const localDataset = path.resolve(here, 'public/dataset')
const siblingDataset = path.resolve(here, '../CookCart_AI_Dataset')
const DS = fs.existsSync(localDataset) ? localDataset : siblingDataset
const j = (n) => JSON.parse(fs.readFileSync(path.join(DS, n), 'utf8'))

// --- Serving test cases ---
const serving = j('serving_test_cases.json')
let sPass = 0
let sFail = 0
const sFails = []
for (const t of serving) {
  const ratio = t.requested_servings / t.base_servings
  for (const i of t.ingredients) {
    const got = scaleIngredientQuantity(i.base_quantity, ratio, i.scaling_rule)
    if (Math.abs(got - i.scaled_quantity) < 1e-9) sPass++
    else {
      sFail++
      if (sFails.length < 8)
        sFails.push({
          test: t.test_id,
          ing: i.ingredient_id,
          rule: i.scaling_rule,
          base: i.base_quantity,
          servings: t.requested_servings,
          exp: i.scaled_quantity,
          got,
        })
    }
  }
}
console.log(`SERVING pass=${sPass} fail=${sFail} total=${sPass + sFail}`)
console.log('serving fails:', JSON.stringify(sFails))

// --- Pack optimization test cases ---
const packs = j('pack_optimization_test_cases.json')
const products = j('products.json').map((p) => ({
  sku_id: p.sku_id,
  pack_size: p.pack_size,
  unit: p.unit,
  price: p.price,
  product_name: p.product_name,
  brand: p.brand,
}))
let pPass = 0
let pFail = 0
const pFails = []
let recPass = 0
let recFail = 0
for (const tc of packs) {
  const options = calculateMultiplePackOptions(tc.required_quantity, tc.unit, products)
  for (const co of tc.candidate_options) {
    const opt = options.find((o) => o.skuId === co.sku_id)
    if (!opt) {
      pFail++
      pFails.push(`${tc.test_id}:${co.sku_id} missing`)
      continue
    }
    const calc = calculatePackOptimization(tc.required_quantity, tc.unit, opt.packSize, opt.unit, opt.price)
    if (
      calc.packCount === co.packs_required &&
      calc.buyingQuantity === co.purchase_quantity &&
      calc.totalPrice === co.total_cost
    ) pPass++
    else {
      pFail++
      pFails.push(
        `${tc.test_id}:${co.sku_id} packs=${calc.packCount}/${co.packs_required} purch=${calc.buyingQuantity}/${co.purchase_quantity} cost=${calc.totalPrice}/${co.total_cost}`,
      )
    }
  }
  // Recommendation: expect the exact-fit / min-cost option to be recommended.
  const rec = getRecommendedPackOption(options, tc.required_quantity)
  const expectSku = tc.candidate_options.find((c) => c.purchase_quantity >= tc.required_quantity).sku_id
  // The task example: for 200g required with 100/200/500 available => 200 recommended
  if (rec) {
    const cost = options.find((o) => o.skuId === rec.skuId)?.totalPrice
    const minCost = Math.min(...options.map((o) => o.totalPrice))
    if (cost === minCost && rec.packCount * rec.packSize >= tc.required_quantity) recPass++
    else {
      recFail++
      pFails.push(`REC ${tc.test_id}: got ${rec.skuId} (min-cost expected)`)
    }
  }
  void expectSku
}
console.log(`PACK pass=${pPass} fail=${pFail}`)
console.log(`PACK-RECOMMENDATION pass=${recPass} fail=${recFail}`)
console.log('pack fails:', JSON.stringify(pFails))
