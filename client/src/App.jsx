import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Rocket } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { FeatureForm } from "./components/FeatureForm";
import { FeatureTable } from "./components/FeatureTable";
import { ProductToolbar } from "./components/ProductToolbar";
import { SummaryBar } from "./components/SummaryBar";
import { usePortfolioData } from "./hooks/usePortfolioData";
import { aggregateProductSummary, enrichFeature } from "./utils/features";
// FeatureIQ v1.0



const DEFAULT_SORTING = {
  key: "roiScore",
  direction: "desc"
};

export default function App() {
  const {
    products,
    selectedProduct,
    selectedProductId,
    setSelectedProductId,
    createProduct,
    saveFeature,
    updateFeatureStatus,
    addComment,
    deleteFeature,
    deleteComment,
    isLoading,
    error,
    dataMode
  } = usePortfolioData();
  const [sorting, setSorting] = useState(DEFAULT_SORTING);
  const [editingFeature, setEditingFeature] = useState(null);

  const features = useMemo(() => {
    const raw = (selectedProduct?.features || []).map(enrichFeature);
    // Sort by ROI score once to assign static ranks
    return [...raw]
      .sort((a, b) => b.roiScore - a.roiScore)
      .map((f, i) => ({ ...f, rank: i + 1 }));
  }, [selectedProduct]);
  const summary = useMemo(() => aggregateProductSummary(selectedProduct?.features || []), [selectedProduct]);

  async function handleSaveFeature(featureInput) {
    await saveFeature(featureInput);
    setEditingFeature(null);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-lg font-medium">Loading FeatureIQ…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-slate-900 font-sans selection:bg-indigo-100">
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
            },
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            style: {
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          loading: {
            style: {
              background: '#f8fafc',
              color: '#334155',
              border: '1px solid #e2e8f0',
            },
          },
        }}
      />
      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-6 py-10 lg:px-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                <Rocket className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-indigo-600">
                Build bet-winning roadmaps
              </p>
            </div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mt-4 text-4xl font-extrabold tracking-tight text-orange-500 sm:text-5xl lg:text-6xl"
            >
              FeatureIQ
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
            >
              Precise prioritization for <span className="text-indigo-600">bet-winning</span> roadmaps
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-slate-500 font-medium"
            >
              Rank features by real-world savings, implementation speed, and executive payoff.
              Built for modern product teams driving operational excellence.
            </motion.p>
          </div>
          <div className="hidden lg:block">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                FeatureIQ v1.0 Live
              </div>
              <p className="mt-2 max-w-[200px] text-xs leading-5 text-slate-400">
                Data is securely persisted and calculated in real-time.
              </p>
            </div>
          </div>
        </header>

        {error ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" />
              Database error
            </div>
            <p className="mt-2">{error}</p>
          </section>
        ) : null}

        <ProductToolbar
          products={products}
          selectedProductId={selectedProductId}
          onProductChange={setSelectedProductId}
          onCreateProduct={createProduct}
          onPrint={() => window.print()}
          dataMode={dataMode}
        />

        {selectedProductId ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-10"
          >
            <SummaryBar summary={summary} />

            <FeatureForm
              selectedProductName={selectedProduct?.name || "your product"}
              editingFeature={editingFeature}
              onSave={handleSaveFeature}
              onCancelEdit={() => setEditingFeature(null)}
              allFeatures={features}
            />

            <FeatureTable
              features={features}
              sorting={sorting}
              onSortingChange={setSorting}
              onStatusChange={updateFeatureStatus}
              onEditFeature={setEditingFeature}
              onAddComment={addComment}
              onDeleteFeature={deleteFeature}
              onDeleteComment={deleteComment}
            />
          </motion.div>
        ) : (
          <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white/90 px-8 py-14 text-center shadow-[0_24px_70px_rgba(30,41,59,0.08)]">
            <h2 className="text-2xl font-semibold text-slate-900">Select or Create a Product</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
              Start by selecting an existing product from the dropdown above or create a new one to begin prioritizing features.
            </p>
            <button
              type="button"
              onClick={() => {
                const name = window.prompt("Product Name");
                if (name) createProduct(name);
              }}
              className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Create first product
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
