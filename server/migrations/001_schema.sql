-- FeatureIQ Database Schema
-- Run with: npm run migrate

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS features (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  owner TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'TBD',
  target_release_date TEXT NOT NULL DEFAULT '',
  strategic_pillar TEXT NOT NULL DEFAULT 'Customer Experience',
  risk_level TEXT NOT NULL DEFAULT 'Medium',
  resource_count NUMERIC NOT NULL DEFAULT 0,
  estimated_days NUMERIC NOT NULL DEFAULT 0,
  base_hourly_rate NUMERIC NOT NULL DEFAULT 0,
  monthly_maintenance_cost NUMERIC NOT NULL DEFAULT 0,
  monthly_cloud_cost NUMERIC NOT NULL DEFAULT 0,
  manual_hours_before NUMERIC NOT NULL DEFAULT 0,
  resources_before NUMERIC NOT NULL DEFAULT 0,
  hourly_cost_before NUMERIC NOT NULL DEFAULT 0,
  automated_hours_after NUMERIC NOT NULL DEFAULT 0,
  resources_after NUMERIC NOT NULL DEFAULT 0,
  hourly_cost_after NUMERIC NOT NULL DEFAULT 0,
  processes_per_month NUMERIC NOT NULL DEFAULT 0,
  opportunity_cost NUMERIC NOT NULL DEFAULT 0,
  revenue_loss_per_month NUMERIC NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  customer_segment TEXT NOT NULL DEFAULT 'Internal Operations',
  dependencies TEXT NOT NULL DEFAULT '',
  users_impacted NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  feature_id TEXT NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  author TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_features_product_id ON features(product_id);
CREATE INDEX IF NOT EXISTS idx_comments_feature_id ON comments(feature_id);
