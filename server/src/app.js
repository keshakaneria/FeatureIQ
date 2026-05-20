import { Hono } from "hono";
import { cors } from "hono/cors";
import { getSql } from "./db.js";

const app = new Hono();

app.use("/api/*", cors());

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
  for (const [key, value] of Object.entries(row)) {
    out[SNAKE_TO_CAMEL[key] || key] = value;
  }
  return out;
}

function castNumerics(obj) {
  for (const field of NUMERIC_FIELDS) {
    if (obj[field] !== undefined && obj[field] !== null) {
      obj[field] = Number(obj[field]);
    }
  }
  return obj;
}

function nowIso() {
  return new Date().toISOString();
}

function errorResponse(message, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

app.onError((err) => {
  console.error("Server error:", err);
  return errorResponse(err.message || "Internal server error");
});

app.get("/api/health", async (c) => {
  const sql = getSql(c.env);
  const rows = await sql`SELECT NOW() AS now`;
  return c.json({ status: "ok", dbTime: rows[0]?.now ?? null });
});

app.get("/api/products", async (c) => {
  const sql = getSql(c.env);
  const [products, features, comments] = await Promise.all([
    sql`SELECT * FROM products ORDER BY created_at ASC`,
    sql`SELECT * FROM features ORDER BY created_at DESC`,
    sql`SELECT * FROM comments ORDER BY created_at ASC`
  ]);

  const commentMap = {};
  for (const row of comments) {
    const comment = rowToCamel(row);
    (commentMap[row.feature_id] ||= []).push({
      id: comment.id,
      author: comment.author,
      text: comment.text,
      createdAt: comment.createdAt
    });
  }

  const featureMap = {};
  for (const row of features) {
    const feature = rowToCamel(row);
    castNumerics(feature);
    delete feature.productId;
    feature.comments = commentMap[feature.id] || [];
    (featureMap[row.product_id] ||= []).push(feature);
  }

  return c.json(products.map((row) => {
    const product = rowToCamel(row);
    product.features = featureMap[product.id] || [];
    return product;
  }));
});

app.post("/api/products", async (c) => {
  const sql = getSql(c.env);
  const body = await c.req.json();
  const name = body.name?.trim();

  if (!name) {
    return c.json({ error: "Product name is required" }, 400);
  }

  const id = crypto.randomUUID();
  const now = nowIso();

  await sql`
    INSERT INTO products (id, name, created_at, updated_at)
    VALUES (${id}, ${name}, ${now}, ${now})
  `;

  return c.json({ id, name, createdAt: now, updatedAt: now, features: [] }, 201);
});

app.delete("/api/products/:id", async (c) => {
  const sql = getSql(c.env);
  await sql`DELETE FROM products WHERE id = ${c.req.param("id")}`;
  return c.json({ ok: true });
});

app.post("/api/products/:productId/features", async (c) => {
  const sql = getSql(c.env);
  const productId = c.req.param("productId");
  const body = await c.req.json();
  const id = body.id || crypto.randomUUID();
  const now = nowIso();

  await sql`
    INSERT INTO features (
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
      ${id}, ${productId},
      ${body.name || ""}, ${body.description || ""}, ${body.owner || ""}, ${body.status || "TBD"},
      ${body.targetReleaseDate || ""}, ${body.strategicPillar || "Customer Experience"},
      ${body.riskLevel || "Medium"},
      ${body.resourceCount ?? 0}, ${body.estimatedDays ?? 0}, ${body.baseHourlyRate ?? 0},
      ${body.monthlyMaintenanceCost ?? 0}, ${body.monthlyCloudCost ?? 0},
      ${body.manualHoursBefore ?? 0}, ${body.resourcesBefore ?? 0}, ${body.hourlyCostBefore ?? 0},
      ${body.automatedHoursAfter ?? 0}, ${body.resourcesAfter ?? 0}, ${body.hourlyCostAfter ?? 0},
      ${body.processesPerMonth ?? 0}, ${body.opportunityCost ?? 0}, ${body.revenueLossPerMonth ?? 0},
      ${body.notes || ""}, ${body.customerSegment || "Internal Operations"},
      ${body.dependencies || ""}, ${body.usersImpacted ?? 0},
      ${body.createdAt || now}, ${now}
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
      updated_at = EXCLUDED.updated_at
  `;

  await sql`
    UPDATE products
    SET updated_at = ${now}
    WHERE id = ${productId}
  `;

  return c.json({ id, saved: true });
});

app.patch("/api/features/:featureId/status", async (c) => {
  const sql = getSql(c.env);
  const body = await c.req.json();
  const now = nowIso();

  await sql`
    UPDATE features
    SET status = ${body.status}, updated_at = ${now}
    WHERE id = ${c.req.param("featureId")}
  `;

  return c.json({ ok: true });
});

app.post("/api/features/:featureId/comments", async (c) => {
  const sql = getSql(c.env);
  const body = await c.req.json();
  const id = crypto.randomUUID();
  const now = nowIso();

  await sql`
    INSERT INTO comments (id, feature_id, author, body, created_at)
    VALUES (${id}, ${c.req.param("featureId")}, ${body.author || ""}, ${body.text || ""}, ${now})
  `;

  return c.json({ id, author: body.author, text: body.text, createdAt: now });
});

app.delete("/api/features/:id", async (c) => {
  const sql = getSql(c.env);
  await sql`DELETE FROM features WHERE id = ${c.req.param("id")}`;
  return c.json({ ok: true });
});

app.delete("/api/comments/:id", async (c) => {
  const sql = getSql(c.env);
  await sql`DELETE FROM comments WHERE id = ${c.req.param("id")}`;
  return c.json({ ok: true });
});

app.notFound(() => errorResponse("Not found", 404));

export default app;
