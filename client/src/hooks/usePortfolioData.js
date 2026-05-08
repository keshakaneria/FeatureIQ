import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  setDoc
} from "firebase/firestore";
import { db, hasFirebaseConfig } from "../config/firebase";
import { DEFAULT_PRODUCT_NAME, EMPTY_FEATURE } from "../constants";
import { demoProducts } from "../data/demoData";

const PRODUCTS_COLLECTION = import.meta.env.VITE_FIRESTORE_PRODUCTS_COLLECTION || "roiProducts";
const LOCAL_STORAGE_KEY = "roi-prioritization-demo-products";

function buildProductDocument(product) {
  return {
    name: product.name,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    features: product.features
  };
}

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

  if (!stored) {
    return demoProducts;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return demoProducts;
  }
}

export function usePortfolioData() {
  const [products, setProducts] = useState(() =>
    hasFirebaseConfig ? [] : loadDemoProducts()
  );
  const [selectedProductId, setSelectedProductId] = useState("");
  const [isLoading, setIsLoading] = useState(hasFirebaseConfig);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasFirebaseConfig) {
      return undefined;
    }

    const productQuery = query(collection(db, PRODUCTS_COLLECTION));
    const unsubscribe = onSnapshot(
      productQuery,
      (snapshot) => {
        const nextProducts = snapshot.docs.map((item) =>
          createProductShape({
            id: item.id,
            ...item.data()
          })
        );

        setProducts(nextProducts);
        setIsLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!hasFirebaseConfig) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (!products.length) {
      setSelectedProductId("");
      return;
    }

    if (!selectedProductId || !products.some((product) => product.id === selectedProductId)) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  async function persistProducts(nextProducts) {
    setProducts(nextProducts);

    if (!hasFirebaseConfig) {
      return;
    }

    const targetProduct = nextProducts.find((product) => product.id === selectedProductId);

    if (targetProduct) {
      await setDoc(
        doc(db, PRODUCTS_COLLECTION, targetProduct.id),
        buildProductDocument(targetProduct)
      );
    }
  }

  async function createProduct(name) {
    const now = new Date().toISOString();

    if (!hasFirebaseConfig) {
      const nextProduct = createProductShape({
        id: crypto.randomUUID(),
        name,
        createdAt: now,
        updatedAt: now,
        features: []
      });
      const nextProducts = [...products, nextProduct];
      setProducts(nextProducts);
      setSelectedProductId(nextProduct.id);
      return;
    }

    const response = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      name,
      createdAt: now,
      updatedAt: now,
      features: []
    });
    setSelectedProductId(response.id);
  }

  async function saveFeature(featureInput) {
    if (!selectedProduct) {
      return;
    }

    const now = new Date().toISOString();
    const normalizedFeature = {
      ...EMPTY_FEATURE,
      ...featureInput,
      id: featureInput.id || crypto.randomUUID(),
      createdAt: featureInput.createdAt || now,
      updatedAt: now,
      comments: featureInput.comments || []
    };

    const nextProducts = products.map((product) => {
      if (product.id !== selectedProduct.id) {
        return product;
      }

      const hasExistingFeature = product.features.some(
        (feature) => feature.id === normalizedFeature.id
      );
      const nextFeatures = hasExistingFeature
        ? product.features.map((feature) =>
            feature.id === normalizedFeature.id ? normalizedFeature : feature
          )
        : [normalizedFeature, ...product.features];

      return {
        ...product,
        updatedAt: now,
        features: nextFeatures
      };
    });

    await persistProducts(nextProducts);
  }

  async function updateFeatureStatus(featureId, status) {
    const targetFeature = selectedProduct?.features.find((feature) => feature.id === featureId);

    if (!targetFeature) {
      return;
    }

    await saveFeature({
      ...targetFeature,
      status
    });
  }

  async function addComment(featureId, commentInput) {
    const targetFeature = selectedProduct?.features.find((feature) => feature.id === featureId);

    if (!targetFeature) {
      return;
    }

    await saveFeature({
      ...targetFeature,
      comments: [
        ...(targetFeature.comments || []),
        {
          id: crypto.randomUUID(),
          author: commentInput.author,
          text: commentInput.text,
          createdAt: new Date().toISOString()
        }
      ]
    });
  }

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
    dataMode: hasFirebaseConfig ? "firestore" : "demo"
  };
}
