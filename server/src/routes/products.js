import { Router } from "express";
import pool from "../db.js";
import crypto from "crypto";

const router = Router();

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const NUMERIC_FIELDS = [
  "resourceCount", "estimatedDays", "baseHourlyRate",
  "monthlyMaintenanceCost", "monthlyCloudCost",
  "manualHoursBefore", "resourcesBefore", "hourlyCostBefore",
  "automatedHoursAfter", "resourcesAfter", "hourlyCostAfter",
  "processesPerMonth", "opportunityCost", "revenueLossPerMonth",
  "usersImpacted"
];

const SNAKE_TO_CAMEL = {
  id: "id", product_id: "productId", name: "name",
  description: "description", owner: "owner", status: "status",
  target_release_date: "targetReleaseDate",
  strategic_pillar: "strategicPillar", risk_level: "riskLevel",
  resource_count: "resourceCount", estimated_days: "estimatedDays",
  base_hourly_rate: "baseHourlyRate",
  monthly_maintenance_cost: "monthlyMaintenanceCost",
  monthly_cloud_cost: "monthlyCloudCost",
  manual_hours_before: "manualHoursBefore",
  resources_before: "resourcesBefore",
  hourly_cost_before: "hourlyCostBefore",
  automated_hours_after: "automatedHoursAfter",
  resources_after: "resourcesAfter",
  hourly_cost_after: "hourlyCostAfter",
  processes_per_month: "processesPerMonth",
  opportunity_cost: "opportunityCost",
  revenue_loss_per_month: "revenueLossPerMonth",
  notes: "notes", customer_segment: "customerSegment",
  dependencies: "dependencies", users_impacted: "usersImpacted",
  created_at: "createdAt", updated_at: "updatedAt",
  author: "author", body: "text", feature_id: "featureId"
};

function rowToCamel(row) {
  if (!row) return null;
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    out[SNAKE_TO_CAMEL[k] || k] = v;
  }
  return out;
}

function castNumerics(obj) {
  for (const f of NUMERIC_FIELDS) {
    if (obj[f] !== undefined && obj[f] !== null) {
      obj[f] = Number(obj[f]);
    }
  }
  return obj;
}

function generateId() {
  return crypto.randomUUID();
}

/* ------------------------------------------------------------------ */
/*  GET /products — all products with nested features & comments      */
/* ------------------------------------------------------------------ */

router.get("/products", async (_req, res, next) => {
  try {
    const [prodRes, featRes, comRes] = await Promise.all([
      pool.query("SELECT * FROM products ORDER BY created_at ASC"),
      pool.query("SELECT * FROM features ORDER BY created_at DESC"),
      pool.query("SELECT * FROM comments ORDER BY created_at ASC")
    ]);

    // group comments by feature_id
    const commentMap = {};
    for (const row of comRes.rows) {
      const c = rowToCamel(row);
      (commentMap[row.feature_id] ||= []).push({
        id: c.id, author: c.author, text: c.text, createdAt: c.createdAt
      });
    }

    // group features by product_id
    const featureMap = {};
    for (const row of featRes.rows) {
      const f = rowToCamel(row);
      castNumerics(f);
      delete f.productId;
      f.comments = commentMap[f.id] || [];
      (featureMap[row.product_id] ||= []).push(f);
    }

    const products = prodRes.rows.map((row) => {
      const p = rowToCamel(row);
      p.features = featureMap[p.id] || [];
      return p;
    });

    res.json(products);
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  POST /products — create a product                                 */
/* ------------------------------------------------------------------ */

router.post("/products", async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: "Product name is required" });
    }
    const id = generateId();
    const now = new Date().toISOString();
    await pool.query(
      "INSERT INTO products (id, name, created_at, updated_at) VALUES ($1, $2, $3, $4)",
      [id, name.trim(), now, now]
    );
    res.status(201).json({ id, name: name.trim(), createdAt: now, updatedAt: now, features: [] });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  DELETE /products/:id                                              */
/* ------------------------------------------------------------------ */

router.delete("/products/:id", async (req, res, next) => {
  try {
    await pool.query("DELETE FROM products WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  POST /products/:productId/features — upsert a feature             */
/* ------------------------------------------------------------------ */

router.post("/products/:productId/features", async (req, res, next) => {
  try {
    const { productId } = req.params;
    const b = req.body;
    const id = b.id || generateId();
    const now = new Date().toISOString();

    await pool.query(
      `INSERT INTO features (
        id, product_id, name, description, owner, status,
        target_release_date, strategic_pillar, risk_level,
        resource_count, estimated_days, base_hourly_rate,
        monthly_maintenance_cost, monthly_cloud_cost,
        manual_hours_before, resources_before, hourly_cost_before,
        automated_hours_after, resources_after, hourly_cost_after,
        processes_per_month, opportunity_cost, revenue_loss_per_month,
        notes, customer_segment, dependencies, users_impacted,
        created_at, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        owner = EXCLUDED.owner,
        status = EXCLUDED.status,
        target_release_date = EXCLUDED.target_release_date,
        strategic_pillar = EXCLUDED.strategic_pillar,
        risk_level = EXCLUDED.risk_level,
        resource_count = EXCLUDED.resource_count,
        estimated_days = EXCLUDED.estimated_days,
        base_hourly_rate = EXCLUDED.base_hourly_rate,
        monthly_maintenance_cost = EXCLUDED.monthly_maintenance_cost,
        monthly_cloud_cost = EXCLUDED.monthly_cloud_cost,
        manual_hours_before = EXCLUDED.manual_hours_before,
        resources_before = EXCLUDED.resources_before,
        hourly_cost_before = EXCLUDED.hourly_cost_before,
        automated_hours_after = EXCLUDED.automated_hours_after,
        resources_after = EXCLUDED.resources_after,
        hourly_cost_after = EXCLUDED.hourly_cost_after,
        processes_per_month = EXCLUDED.processes_per_month,
        opportunity_cost = EXCLUDED.opportunity_cost,
        revenue_loss_per_month = EXCLUDED.revenue_loss_per_month,
        notes = EXCLUDED.notes,
        customer_segment = EXCLUDED.customer_segment,
        dependencies = EXCLUDED.dependencies,
        users_impacted = EXCLUDED.users_impacted,
        updated_at = EXCLUDED.updated_at`,
      [
        id, productId,
        b.name || "", b.description || "", b.owner || "", b.status || "TBD",
        b.targetReleaseDate || "", b.strategicPillar || "Customer Experience",
        b.riskLevel || "Medium",
        b.resourceCount ?? 0, b.estimatedDays ?? 0, b.baseHourlyRate ?? 0,
        b.monthlyMaintenanceCost ?? 0, b.monthlyCloudCost ?? 0,
        b.manualHoursBefore ?? 0, b.resourcesBefore ?? 0, b.hourlyCostBefore ?? 0,
        b.automatedHoursAfter ?? 0, b.resourcesAfter ?? 0, b.hourlyCostAfter ?? 0,
        b.processesPerMonth ?? 0, b.opportunityCost ?? 0, b.revenueLossPerMonth ?? 0,
        b.notes || "", b.customerSegment || "Internal Operations",
        b.dependencies || "", b.usersImpacted ?? 0,
        b.createdAt || now, now
      ]
    );

    // Also update product's updated_at
    await pool.query(
      "UPDATE products SET updated_at = $1 WHERE id = $2",
      [now, productId]
    );

    res.json({ id, saved: true });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  PATCH /features/:featureId/status                                 */
/* ------------------------------------------------------------------ */

router.patch("/features/:featureId/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    const now = new Date().toISOString();
    await pool.query(
      "UPDATE features SET status = $1, updated_at = $2 WHERE id = $3",
      [status, now, req.params.featureId]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  POST /features/:featureId/comments                                */
/* ------------------------------------------------------------------ */

router.post("/features/:featureId/comments", async (req, res, next) => {
  try {
    const { author, text } = req.body;
    const id = generateId();
    const now = new Date().toISOString();
    await pool.query(
      "INSERT INTO comments (id, feature_id, author, body, created_at) VALUES ($1, $2, $3, $4, $5)",
      [id, req.params.featureId, author || "", text || "", now]
    );
    res.json({ id, author, text, createdAt: now });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  DELETE /features/:id                                              */
/* ------------------------------------------------------------------ */

router.delete("/features/:id", async (req, res, next) => {
  try {
    await pool.query("DELETE FROM features WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

/* ------------------------------------------------------------------ */
/*  DELETE /comments/:id                                              */
/* ------------------------------------------------------------------ */

router.delete("/comments/:id", async (req, res, next) => {
  try {
    await pool.query("DELETE FROM comments WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export { router as productRoutes };
