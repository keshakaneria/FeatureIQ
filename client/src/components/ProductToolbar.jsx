import { Database, Plus, Printer } from "lucide-react";

export function ProductToolbar({
  products,
  selectedProductId,
  onProductChange,
  onCreateProduct,
  onPrint,
  dataMode
}) {
  function handleCreateProduct() {
    const nextName = window.prompt("Product name");

    if (nextName?.trim()) {
      onCreateProduct(nextName.trim());
    }
  }

  return (
    <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-[0_24px_70px_rgba(30,41,59,0.08)] backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">
            Multi-product portfolio
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <select
              value={selectedProductId}
              onChange={(event) => onProductChange(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white"
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleCreateProduct}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              <Plus className="h-4 w-4" />
              Add product
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white">
            <Database className="h-3.5 w-3.5" />
            {dataMode === "firestore" ? "Firestore Live" : "Demo Mode"}
          </div>

          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            <Printer className="h-4 w-4" />
            Print view
          </button>
        </div>
      </div>
    </section>
  );
}
