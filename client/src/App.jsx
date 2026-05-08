import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Rocket } from "lucide-react";
import { FeatureForm } from "./components/FeatureForm";
import { FeatureTable } from "./components/FeatureTable";
import { ProductToolbar } from "./components/ProductToolbar";
import { SummaryBar } from "./components/SummaryBar";
import { usePortfolioData } from "./hooks/usePortfolioData";
import { aggregateProductSummary, enrichFeature } from "./utils/features";

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
    isLoading,
    error,
    dataMode
  } = usePortfolioData();
  const [sorting, setSorting] = useState(DEFAULT_SORTING);
  const [editingFeature, setEditingFeature] = useState(null);

  const features = useMemo(
    () => (selectedProduct?.features || []).map(enrichFeature),
    [selectedProduct]
  );
  const summary = useMemo(() => aggregateProductSummary(selectedProduct?.features || []), [selectedProduct]);

  async function handleSaveFeature(featureInput) {
    await saveFeature(featureInput);
    setEditingFeature(null);
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-600">Loading portfolio…</div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe_0%,transparent_28%),linear-gradient(180deg,#f8fafc_0%,#f8fafc_35%,#f5f1ea_100%)] text-slate-900">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[2.4rem] bg-[linear-gradient(135deg,#0f172a_0%,#312e81_55%,#2563eb_100%)] px-8 py-10 text-white shadow-[0_30px_120px_rgba(37,99,235,0.22)]">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-200">
              Feature ROI Prioritisation Tool
            </p>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Rank roadmap bets by savings, speed, and executive payoff.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-indigo-100">
                  Multi-product ROI tracking for PMs and executives, built as a fast-entry MVP with
                  live Firestore persistence, status-driven workflow, and table-first comparison.
                </p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Rocket className="h-4 w-4" />
                  Hosted as a static GitHub Pages app
                </div>
                <p className="mt-2 max-w-xs text-sm leading-6 text-indigo-100">
                  Firestore keeps the data live without needing a paid backend or sign-in flow for
                  this first version.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {error ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" />
              Firestore error
            </div>
            <p className="mt-2">{error}</p>
          </section>
        ) : null}

        {dataMode === "demo" ? (
          <section className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            Firebase environment variables are not configured yet, so the app is running in demo
            mode with browser-local persistence. Add the <code>VITE_FIREBASE_*</code> variables
            from <code>client/.env.example</code> to switch to permanent Firestore storage.
          </section>
        ) : null}

        {products.length ? (
          <>
            <ProductToolbar
              products={products}
              selectedProductId={selectedProductId}
              onProductChange={setSelectedProductId}
              onCreateProduct={createProduct}
              onPrint={() => window.print()}
              dataMode={dataMode}
            />

            <SummaryBar summary={summary} />

            <FeatureForm
              selectedProductName={selectedProduct?.name || "your product"}
              editingFeature={editingFeature}
              onSave={handleSaveFeature}
            />

            <FeatureTable
              features={features}
              sorting={sorting}
              onSortingChange={setSorting}
              onStatusChange={updateFeatureStatus}
              onEditFeature={setEditingFeature}
              onAddComment={addComment}
            />
          </>
        ) : (
          <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white/90 px-8 py-14 text-center shadow-[0_24px_70px_rgba(30,41,59,0.08)]">
            <h2 className="text-2xl font-semibold text-slate-900">Start with your first product</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
              The app is ready for multiple isolated product dashboards. Create one product and then
              start adding features with live ROI calculations.
            </p>
            <button
              type="button"
              onClick={() => createProduct("New Product")}
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
