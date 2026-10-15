import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";

const defaults = {
  title: "",
  description: "",
  category: "other",
  status: "lost",
  location: "",
};

export default function ItemForm() {
  const nav = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState(defaults);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load the existing item when editing
  useEffect(() => {
    if (!id) {
      setForm(defaults);
      setError("");
      return;
    }

    let cancelled = false;

    async function loadItem() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/items/${id}`);
        const item = response.data.item;

        if (!cancelled) {
          setForm({
            title: item.title ?? "",
            description: item.description ?? "",
            category: item.category ?? "other",
            status: item.status ?? "lost",
            location: item.location ?? "",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Failed to load item. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadItem();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Update the corresponding form field
  function onChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // Create a new item or update an existing one
  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const payload = {
        title: form.title.trim(),
        status: form.status,
        category: form.category,
        location: form.location.trim(),
        description: form.description.trim(),
      };

      if (id) {
        await api.patch(`/items/${id}`, payload);
      } else {
        await api.post("/items", payload);
      }

      nav("/items");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save item. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">
        {id ? "Edit" : "Report"} Item
      </h1>

      {loading && (
        <p className="text-sm mb-3" role="status">
          Loading...
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="title" className="block mb-1">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="input w-full"
            placeholder="e.g. Black backpack"
            value={form.title}
            onChange={onChange}
            minLength={2}
            required
          />
        </div>

        <div>
          <label htmlFor="status" className="block mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="input w-full"
            value={form.status}
            onChange={onChange}
            required
          >
            <option value="lost">Lost</option>
            <option value="found">Found</option>
            <option value="claimed">Claimed</option>
          </select>
        </div>

        <div>
          <label htmlFor="category" className="block mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="input w-full"
            value={form.category}
            onChange={onChange}
            required
          >
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="documents">Documents</option>
            <option value="accessories">Accessories</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block mb-1">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            className="input w-full"
            placeholder="e.g. Library, 2nd floor"
            value={form.location}
            onChange={onChange}
          />
        </div>

        <div>
          <label htmlFor="description" className="block mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="input w-full"
            rows={4}
            placeholder="Describe the item..."
            value={form.description}
            onChange={onChange}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm" role="alert">
            {error}
          </div>
        )}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
