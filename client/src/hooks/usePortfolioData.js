import { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "../config/api";
import { DEFAULT_PRODUCT_NAME, EMPTY_FEATURE } from "../constants";
import { demoProducts } from "../data/demoData";

const LOCAL_STORAGE_KEY = "roi-prioritization-demo-products";

// Check if backend is available — determined at first fetch
let backendAvailable = null;

// Fallback for random ID
const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

function createProductShape(partial) {
  return {
    id: partial.id,
    name: partial.name || DEFAULT_PRODUCT_NAME,
    createdAt: partial.createdAt || new Date().toISOString(),
    updatedAt: partial.updatedAt || new Date().toISOString(),
    features: partial.features || []
  };
}

function loadDemoProducts() {
  const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) return demoProducts;
  try {
    return JSON.parse(stored);
  } catch {
    return demoProducts;
  }
}

export function usePortfolioData() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [dataMode, setDataMode] = useState("loading");

  /* ---------------------------------------------------------------- */
  /*  Fetch all products from the API (or fall back to demo)          */
  /* ---------------------------------------------------------------- */

  const fetchProducts = useCallback(async () => {
    try {
      const data = await api.getProducts();
      backendAvailable = true;
      setDataMode("postgres");
      setProducts(data.map(createProductShape));
      setError("");
    } catch (err) {
      console.warn("⚠️ Backend not reachable, falling back to demo mode:", err.message);
      backendAvailable = false;
      setDataMode("demo");
      setProducts(loadDemoProducts());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Persist demo-mode data to localStorage
  useEffect(() => {
    if (dataMode === "demo") {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
    }
  }, [products, dataMode]);

  // Auto-select first product when list changes
  useEffect(() => {
    if (!products.length) {
      setSelectedProductId("");
      return;
    }
    if (!selectedProductId || !products.some((p) => p.id === selectedProductId)) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  /* ---------------------------------------------------------------- */
  /*  Create product                                                  */
  /* ---------------------------------------------------------------- */

  async function createProduct(name) {
    const now = new Date().toISOString();

    if (!backendAvailable) {
      const next = createProductShape({
        id: generateId(),
        name,
        createdAt: now,
        updatedAt: now,
        features: []
      });
      setProducts((prev) => [...prev, next]);
      setSelectedProductId(next.id);
      return;
    }

    try {
      const created = await api.createProduct(name);
      setSelectedProductId(created.id);
      await fetchProducts();
    } catch (err) {
      console.error("Failed to create product:", err);
      throw new Error(`Failed to create product: ${err.message}`);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Save feature (create or update)                                 */
  /* ---------------------------------------------------------------- */

  async function saveFeature(featureInput) {
    if (!selectedProduct) {
      throw new Error("No product selected");
    }

    const now = new Date().toISOString();
    const normalizedFeature = {
      ...EMPTY_FEATURE,
      ...featureInput,
      id: featureInput.id || generateId(),
      createdAt: featureInput.createdAt || now,
      updatedAt: now,
      comments: featureInput.comments || []
    };

    if (!backendAvailable) {
      // Demo mode: update local state
      setProducts((prev) =>
        prev.map((product) => {
          if (product.id !== selectedProduct.id) return product;
          const exists = product.features.some((f) => f.id === normalizedFeature.id);
          const nextFeatures = exists
            ? product.features.map((f) => (f.id === normalizedFeature.id ? normalizedFeature : f))
            : [normalizedFeature, ...product.features];
          return { ...product, updatedAt: now, features: nextFeatures };
        })
      );
      return;
    }

    try {
      await api.saveFeature(selectedProduct.id, normalizedFeature);
      await fetchProducts();
    } catch (err) {
      console.error("Failed to save feature:", err);
      throw new Error(err.message);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Update feature status                                           */
  /* ---------------------------------------------------------------- */

  async function updateFeatureStatus(featureId, status) {
    const target = selectedProduct?.features.find((f) => f.id === featureId);
    if (!target) return;

    if (!backendAvailable) {
      await saveFeature({ ...target, status });
      return;
    }

    try {
      await api.updateFeatureStatus(featureId, status);
      await fetchProducts();
    } catch (err) {
      console.error("Failed to update status:", err);
      throw new Error(err.message);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Add comment                                                     */
  /* ---------------------------------------------------------------- */

  async function addComment(featureId, commentInput) {
    const target = selectedProduct?.features.find((f) => f.id === featureId);
    if (!target) return;

    if (!backendAvailable) {
      await saveFeature({
        ...target,
        comments: [
          ...(target.comments || []),
          {
            id: generateId(),
            author: commentInput.author,
            text: commentInput.text,
            createdAt: new Date().toISOString()
          }
        ]
      });
      return;
    }

    try {
      await api.addComment(featureId, commentInput);
      await fetchProducts();
    } catch (err) {
      console.error("Failed to add comment:", err);
      throw new Error(err.message);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Return — identical interface to the old hook                    */
  /* ---------------------------------------------------------------- */

  return {
    products,
    selectedProduct,
    selectedProductId,
    setSelectedProductId,
    createProduct,
    saveFeature,
    updateFeatureStatus,
    addComment,
    isLoading,
    error,
    dataMode
  };
}
