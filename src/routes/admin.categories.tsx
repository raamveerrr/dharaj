import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Edit2, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";
import { CloudinaryService } from "@/services/cloudinaryService";
import { CategoryService } from "@/services/categoryService";
import type { Category } from "@/types/category";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({ meta: [{ title: "Categories — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminCategoriesPage,
});

const initialCategoryForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
  featured: false,
};

function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>(Array.from({ length: 1 }, () => null));
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const nextCategories = await CategoryService.getCategories();
      setCategories(nextCategories);
    } catch (error) {
      console.error("Failed to load categories", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const resetForm = () => {
    setCategoryForm(initialCategoryForm);
    setEditingId(null);
    setImageFiles(Array.from({ length: 1 }, () => null));
    setShowForm(false);
  };

  const populateForm = (category: Category) => {
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      featured: category.featured,
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const saveCategory = async () => {
    if (!categoryForm.name.trim() || !categoryForm.slug.trim()) {
      toast.error("Name and slug are required.");
      return;
    }

    setIsSaving(true);
    try {
      const selectedFile = imageFiles[0];
      const uploadedImage = selectedFile ? await CloudinaryService.uploadImage(selectedFile, "categories") : null;
      const image = uploadedImage?.url ?? categoryForm.image;
      const payload = {
        name: categoryForm.name.trim(),
        slug: toSlug(categoryForm.slug),
        description: categoryForm.description.trim(),
        image,
        isActive: true,
        featured: categoryForm.featured,
        order: editingId ? categories.find((category) => category.id === editingId)?.order ?? 0 : categories.length,
      };

      if (editingId) {
        await CategoryService.updateCategory(editingId, payload);
        await queryClient.invalidateQueries({ queryKey: ["categories"] });
        await queryClient.invalidateQueries({ queryKey: ["homepage"] });
        setCategories((prev) => prev.map((category) => (category.id === editingId ? { ...category, ...payload } : category)));
        toast.success("Category updated");
      } else {
        const createdId = await CategoryService.createCategory(payload);
        const createdCategory: Category = {
          id: createdId,
          ...payload,
        };
        await queryClient.invalidateQueries({ queryKey: ["categories"] });
        await queryClient.invalidateQueries({ queryKey: ["homepage"] });
        setCategories((prev) => [createdCategory, ...prev]);
        toast.success("Category created");
      }

      resetForm();
      await loadCategories();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save category.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await CategoryService.deleteCategory(id);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["homepage"] });
      setCategories((prev) => prev.filter((category) => category.id !== id));
      toast.success("Category deleted");
      setDeleteTargetId(null);
      if (editingId === id) resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete category.";
      toast.error(message);
    }
  };

  const totalFeatured = useMemo(() => categories.filter((category) => category.featured).length, [categories]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-muted-foreground">{categories.length} total</div>
          <div className="text-xs text-muted-foreground">{totalFeatured} featured</div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New Category
        </button>
      </div>

      {showForm ? (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Name</span>
              <input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ghee"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Slug</span>
              <input
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="ghee"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</span>
              <textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this category"
                className="mt-1 min-h-24 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <input
                type="checkbox"
                checked={categoryForm.featured}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, featured: e.target.checked }))}
                className="h-4 w-4 rounded border-border bg-background"
              />
              Feature category
            </label>
          </div>

          <div className="mt-4">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category image</label>
            <div className="mt-2">
              <ProductImageUploader
                max={1}
                aspect={1}
                outputWidth={1200}
                outputHeight={1200}
                value={[categoryForm.image]}
                onChange={(nextImages) => setCategoryForm((prev) => ({ ...prev, image: nextImages[0] ?? "" }))}
                onFilesChange={setImageFiles}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={resetForm}
              className="rounded-full border border-border px-4 py-2 text-sm font-bold hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => void saveCategory()}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : editingId ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" /> Loading categories...
        </div>
      ) : (
        <div className="grid gap-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                <img src={category.image || ""} alt={category.name} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold">{category.name}</span>
                  {category.featured ? <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">Featured</span> : null}
                </div>
                <div className="text-xs text-muted-foreground">/{category.slug}</div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => populateForm(category)}
                  className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteTargetId === category.id ? deleteCategory(category.id) : setDeleteTargetId(category.id)}
                  className="grid h-8 w-8 place-items-center rounded-full text-sale hover:bg-sale/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
