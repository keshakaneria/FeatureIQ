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
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedProductId || ""}
              onChange={(event) => onProductChange(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-100 cursor-pointer shadow-sm hover:border-slate-300"
            >
              <option value="" disabled>Select a Product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleCreateProduct}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-6 py-3.5 text-sm font-bold text-violet-700 transition-all hover:bg-violet-100 active:scale-95 shadow-sm"
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
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-violet-200"
          >
            <Printer className="h-4 w-4" />
            Generate PDF Report
          </button>
        </div>
      </div>
    </section>
  );
}
