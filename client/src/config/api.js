// API configuration — replaces firebase.js
// In development, Vite proxy forwards /api → backend server
// In production, set VITE_API_URL to your deployed backend URL

const API_BASE = import.meta.env.VITE_API_URL || "";

export const api = {
  async getProducts() {
    const res = await fetch(`${API_BASE}/api/products`);
    if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`);
    return res.json();
  },

  async createProduct(name) {
    const res = await fetch(`${API_BASE}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error(`Failed to create product: ${res.statusText}`);
    return res.json();
  },

  async deleteProduct(productId) {
    const res = await fetch(`${API_BASE}/api/products/${productId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error(`Failed to delete product: ${res.statusText}`);
    return res.json();
  },

  async saveFeature(productId, featureData) {
    const res = await fetch(`${API_BASE}/api/products/${productId}/features`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(featureData)
    });
    if (!res.ok) throw new Error(`Failed to save feature: ${res.statusText}`);
    return res.json();
  },

  async updateFeatureStatus(featureId, status) {
    const res = await fetch(`${API_BASE}/api/features/${featureId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error(`Failed to update status: ${res.statusText}`);
    return res.json();
  },

  async addComment(featureId, comment) {
    const res = await fetch(`${API_BASE}/api/features/${featureId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comment)
    });
    if (!res.ok) throw new Error(`Failed to add comment: ${res.statusText}`);
    return res.json();
  },

  async healthCheck() {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.json();
  }
};
