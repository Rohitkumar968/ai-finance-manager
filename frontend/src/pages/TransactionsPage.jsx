import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../features/transactions/transactionSlice";
import TransactionModal from "../components/ui/TransactionModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatCurrency = (value, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    value || 0,
  );

const TransactionsPage = () => {
  const dispatch = useDispatch();
  const { items, total, page, totalPages, isLoading } = useSelector(
    (state) => state.transactions,
  );
  const currency = useSelector((state) => state.auth.user?.currency) || "USD";

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    sortBy: "date",
    sortOrder: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const loadTransactions = useCallback(() => {
    dispatch(fetchTransactions({ ...filters, page: currentPage, limit: 10 }));
  }, [dispatch, filters, currentPage]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleFilterChange = (e) => {
    setCurrentPage(1);
    setFilters({ ...filters, [e.target.name]: e.target.value });
    console.log(e.target.name, e.target.value);
  };

  const handleSort = (field) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === "desc" ? "asc" : "desc",
    }));
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };
  const handleExportCSV = () => {
    const headers = ["Date", "Type", "Category", "Description", "Amount"];

    const rows = items.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.category,
      t.description,
      t.amount,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transactions.csv";
    link.click();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("AI Finance Manager", 14, 20);

    autoTable(doc, {
      head: [["Date", "Type", "Category", "Description", "Amount"]],
      body: items.map((t) => [
        new Date(t.date).toLocaleDateString(),
        t.type,
        t.category,
        t.description || "-",
        `${t.type === "income" ? "+" : "-"}${t.amount}`,
      ]),
      startY: 30,
    });

    doc.save("transactions.pdf");
  };

const handleEdit = (transaction) => {
  setEditingTransaction(transaction);
  setModalOpen(true);
};

const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this transaction?"))
    return;
  const result = await dispatch(deleteTransaction(id));
  if (deleteTransaction.fulfilled.match(result)) {
    toast.success("Transaction deleted");
    loadTransactions();
  } else {
    toast.error(result.payload || "Failed to delete");
  }
};

const handleSubmit = async (payload) => {
  let result;
  if (editingTransaction) {
    result = await dispatch(
      updateTransaction({ id: editingTransaction._id, payload }),
    );
  } else {
    result = await dispatch(createTransaction(payload));
  }

  if (result.meta.requestStatus === "fulfilled") {
    toast.success(
      editingTransaction ? "Transaction updated" : "Transaction added",
    );
    setModalOpen(false);
    loadTransactions();
  } else {
    toast.error(result.payload || "Something went wrong");
  }
};

return (
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">💳 Transactions</h1>

      <p className="mt-1 text-gray-500">{total} Total Transactions</p>
    </div>

    <div className="flex gap-3">
      <button
        onClick={handleAdd}
        className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-105"
      >
        + Add Transaction
      </button>

      <button
        onClick={handleExportCSV}
        className="rounded-xl border border-gray-300 px-5 py-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
      >
        Export CSV
      </button>
      <button
        onClick={handleExportPDF}
        className="rounded-xl border border-gray-300 px-5 py-3 hover:bg-gray-100"
      >
        Export PDF
      </button>
    </div>

    <div className="glass-card p-4 flex items-center gap-4 w-full">
      <input
        type="text"
        name="search"
        placeholder="Search transactions..."
        className="input-field flex-1"
        value={filters.search}
        onChange={handleFilterChange}
      />

      <select
        name="type"
        value={filters.type}
        onChange={handleFilterChange}
        className="w-56 rounded-xl border border-gray-300 px-4 py-3"
      >
        <option value="">All Types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
    </div>
    <div className="glass-card w-full border border-white/20 shadow-2xl overflow-hidden">
      {isLoading ? (
        <div className="p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-12 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">
          No transactions found. Try adjusting your filters or add a new
          transaction.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-left">
                <th
                  className="py-4 px-5 font-semibold text-gray-500 cursor-pointer"
                  onClick={() => handleSort("date")}
                >
                  Date{" "}
                  {filters.sortBy === "date" &&
                    (filters.sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-3 px-4 font-medium text-gray-500">
                  Category
                </th>
                <th className="py-3 px-4 font-medium text-gray-500">
                  Description
                </th>
                <th className="py-3 px-4 font-medium text-gray-500">Tags</th>
                <th
                  className="cursor-pointer py-3 px-4 font-medium text-gray-500 text-right"
                  onClick={() => handleSort("amount")}
                >
                  Amount{" "}
                  {filters.sortBy === "amount" &&
                    (filters.sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-3 px-4 font-medium text-gray-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr
                  key={t._id}
                  className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50/50 dark:hover:bg-gray-900/40"
                >
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(t.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded-lg bg-primary-50 dark:bg-primary-500/10 px-2.5 py-1 text-xs font-medium text-primary-700 dark:text-primary-300">
                      {t.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                    {t.description || "—"}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {t.tags?.length ? t.tags.join(", ") : "—"}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-semibold ${
                      t.type === "income"
                        ? "text-success-600"
                        : "text-danger-600"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount, currency)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(t)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t._id)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-danger-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {totalPages > 1 && (
      <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
        <button
          disabled={page <= 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="btn-secondary !py-1.5 !px-3 text-xs disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="btn-secondary !py-1.5 !px-3 text-xs disabled:opacity-40"
        >
          Next
        </button>
      </div>
    )}

    <TransactionModal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      onSubmit={handleSubmit}
      initialData={editingTransaction}
    />
  </div>
);
};
export default TransactionsPage;
