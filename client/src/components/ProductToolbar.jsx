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
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Environment</p>
              <p className="text-sm font-bold text-slate-900">{dataMode === "postgres" ? "Cloud Sync Active" : "Local Demo Mode"}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedProductId || ""}
              onChange={(event) => onProductChange(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-3.5 text-sm font-bold text-slate-700 outline-none transition-all focus:border-indigo-500 focus:bg-white cursor-pointer shadow-sm hover:border-indigo-300"
            >
              <option value="" disabled>Select a Product Portfolio...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleCreateProduct}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-6 py-3.5 text-sm font-bold text-indigo-600 transition-all hover:bg-indigo-100 active:scale-95 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              New Product
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-95 shadow-lg shadow-slate-200"
          >
            <Printer className="h-4 w-4" />
            Generate PDF Report
          </button>
        </div>
      </div>
    </section>
  );
}
