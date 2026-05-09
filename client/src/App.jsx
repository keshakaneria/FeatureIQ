import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Rocket, ExternalLink, Heart } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
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
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-800 border-t-transparent"></div>
          <p className="text-lg font-medium">Loading FeatureIQ…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-200">
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
        <header className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 pb-2">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-white shadow-sm border border-slate-700">
                <Rocket className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Build robust roadmaps
              </p>
            </div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
            >
              FeatureIQ
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-3xl font-bold tracking-tight text-slate-700 sm:text-4xl"
            >
              Precise prioritization for <span className="text-slate-900 border-b-2 border-slate-300">bet-winning</span> roadmaps
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
            <div className="flex items-center gap-6 justify-end pb-20 pr-1">
              <div className="flex items-center gap-6">
                <a
                  href="https://github.com/keshakaneria/FeatureIQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-900"
                >
                  <FaGithub className="h-5 w-5" />
                </a>
                <a
                  href="https://linkedin.com/in/kesha-k-kaneria"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-900"
                >
                  <FaLinkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <div className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
                FeatureIQ v1.0 Live
              </div>
              <p className="mt-2 max-w-[200px] text-xs leading-5 text-slate-500">
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
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 lg:p-20 text-center shadow-sm"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-600 mb-8">
              <Rocket className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Ready to Prioritize?</h2>
            <p className="mx-auto mt-4 max-w-lg text-base font-normal text-slate-500 leading-relaxed">
              Step 1: Select a product from the dropdown above to view its strategic roadmap.
              Once selected, you can begin adding features and analyzing their ROI.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  const name = window.prompt("Product Name");
                  if (name) createProduct(name);
                }}
                className="rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95"
              >
                Create New Product
              </button>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                or use the dropdown to switch
              </div>
            </div>
          </motion.section>
        )}

        <footer className="mt-10 flex flex-col items-center gap-6 border-t border-slate-100 pt-12 pb-16">
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/keshakaneria/FeatureIQ"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-900"
            >
              <FaGithub className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com/in/kesha-k-kaneria"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-900"
            >
              <FaLinkedin className="h-5 w-5" />
            </a>
          </div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Built with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> by <a
              href="https://keshakaneria.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-indigo-600"
            ><u>Kesha Kaneria</u></a>
          </p>
        </footer>
      </main>
    </div>
  );
}
