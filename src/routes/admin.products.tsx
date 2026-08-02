import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Component, useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Edit2, Plus, Search, Trash2, ChevronDown, ChevronUp, Images } from "lucide-react";
import { inr } from "@/lib/format";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";
import { DataTable } from "@/components/admin/DataTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CloudinaryService } from "@/services/cloudinaryService";
import { ProductService } from "@/services/productService";
import { CategoryService } from "@/services/categoryService";
import type { Product, ProductImage } from "@/types/product";
import type { Category } from "@/types/category";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminProductsPage,
});

const initialProductForm = {
  name: "",
  description: "",
  category: "",
  categoryId: "",
  price: "",
  mrp: "",
  stock: "",
  weight: "",
  sku: "",
  featured: false,
  bestSeller: false,
  newArrival: false,
};

function AdminProductsPage() {
  return (
    <AdminProductsErrorBoundary>
      <AdminProducts />
    </AdminProductsErrorBoundary>
  );
}

function AdminProducts() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editingImages, setEditingImages] = useState<string | null>(null);
  const [productFiles, setProductFiles] = useState<(File | null)[]>(Array.from({ length: 5 }, () => null));
  const [uploadedImages, setUploadedImages] = useState<ProductImage[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [imageDraft, setImageDraft] = useState<(string | null)[]>(Array.from({ length: 5 }, () => null));
  const [imageFiles, setImageFiles] = useState<(File | null)[]>(Array.from({ length: 5 }, () => null));
  const [isUpdatingImages, setIsUpdatingImages] = useState(false);
  const [imageManagementError, setImageManagementError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const submittingRef = useRef(false);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          ProductService.getProducts(),
          CategoryService.getCategories(),
        ]);
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to load products", error);
        toast.error("Failed to load products");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    void loadProducts();
  }, []);

  const currentEditingProduct = useMemo(
    () => products.find((product) => product.id === editingImages) ?? null,
    [editingImages, products],
  );

  const updateProductForm = useCallback((key: keyof typeof productForm, value: string | boolean) => {
    setProductForm((prev) => ({ ...prev, [key]: value }));
  }, [productForm]);

  const resetForm = useCallback(() => {
    setProductForm(initialProductForm);
    setEditingProductId(null);
    setProductFiles(Array.from({ length: 5 }, () => null));
    setUploadedImages([]);
    setUploadError(null);
  }, []);

  const populateForm = useCallback((product: Product) => {
    const selectedCategory = categories.find((category) => category.id === product.categoryId) ?? null;
    setProductForm({
      name: product.name,
      description: product.description,
      category: selectedCategory?.slug || product.category || "",
      categoryId: product.categoryId || selectedCategory?.id || "",
      price: String(product.price),
      mrp: String(product.mrp),
      stock: String(product.stock),
      weight: product.weight || "",
      sku: product.sku || "",
      featured: product.featured,
      bestSeller: product.bestSeller,
      newArrival: product.newArrival,
    });
    setEditingProductId(product.id);
    setShowAdd(true);
  }, [categories]);

  const handleDeleteProduct = async (id: string) => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    try {
      await ProductService.deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product.id !== id));
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["homepage"] });
      toast.success("Product deleted successfully");
      setDeleteTargetId(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete product.";
      toast.error(message);
    } finally {
      submittingRef.current = false;
    }
  };

  const resetImageManager = useCallback(() => {
    setImageDraft(Array.from({ length: 5 }, () => null));
    setImageFiles(Array.from({ length: 5 }, () => null));
    setImageManagementError(null);
  }, []);

  const handleOpenImageManager = useCallback((productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    const nextDraft = Array.from({ length: 5 }, (_, index) => product.images[index]?.url ?? null);
    setImageDraft(nextDraft);
    setImageFiles(Array.from({ length: 5 }, () => null));
    setImageManagementError(null);
    setEditingImages(productId);
  }, [products]);

  const handleSaveImages = async () => {
    if (!editingImages || isUpdatingImages || submittingRef.current) return;

    const productToUpdate = products.find((item) => item.id === editingImages);
    if (!productToUpdate) return;

    submittingRef.current = true;
    setIsUpdatingImages(true);
    setImageManagementError(null);

    try {
      const remainingExistingImages = [...productToUpdate.images];
      const nextImages: ProductImage[] = [];

      for (let index = 0; index < 5; index += 1) {
        const preview = imageDraft[index];
        const file = imageFiles[index];

        if (file) {
          const uploadedImage = await CloudinaryService.uploadImage(file, "products");
          nextImages.push(uploadedImage);
          continue;
        }

        if (!preview) continue;

        const existingMatch = remainingExistingImages.find((image) => image.url === preview);
        if (existingMatch) {
          nextImages.push(existingMatch);
          remainingExistingImages.splice(remainingExistingImages.indexOf(existingMatch), 1);
        }
      }

      await ProductService.updateProduct(editingImages, {
        images: nextImages,
        updatedAt: new Date(),
      });

      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["homepage"] });
      setProducts((prev) => prev.map((product) => (product.id === editingImages ? { ...product, images: nextImages, updatedAt: new Date() } : product)));
      toast.success("Images updated successfully");
      setEditingImages(null);
      resetImageManager();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update images.";
      setImageManagementError(message);
      toast.error(message);
    } finally {
      submittingRef.current = false;
      setIsUpdatingImages(false);
    }
  };

  const validateProductForm = useCallback(() => {
    const errors: string[] = [];

    if (!productForm.name.trim()) errors.push("Product name is required.");
    if (!productForm.categoryId.trim()) errors.push("Category is required.");
    if (!productForm.price || Number(productForm.price) <= 0) errors.push("Price must be greater than 0.");
    if (!productForm.mrp || Number(productForm.mrp) <= 0) errors.push("MRP must be greater than 0.");
    if (!productForm.stock || Number(productForm.stock) < 0) errors.push("Stock cannot be negative.");

    return errors;
  }, [productForm]);

  const handleSaveProduct = async () => {
    if (isUploading || isSaving || submittingRef.current) return;

    const errors = validateProductForm();
    if (errors.length > 0) {
      setFormErrors(errors);
      toast.error(errors[0]);
      return;
    }

    const selectedFiles = productFiles.filter((file): file is File => Boolean(file)).slice(0, 5);

    submittingRef.current = true;
    setIsUploading(true);
    setIsSaving(true);
    setUploadError(null);
    setFormErrors([]);

    try {
      const images = selectedFiles.length > 0
        ? await CloudinaryService.uploadImages(selectedFiles, "products")
        : [];

      setUploadedImages(images);

      const selectedCategory = categories.find((category) => category.id === productForm.categoryId) ?? null;
      const payload: Omit<Product, "id"> = {
        name: productForm.name.trim(),
        slug: createSlug(productForm.name),
        description: productForm.description.trim(),
        category: selectedCategory?.slug || productForm.category.trim(),
        categoryId: selectedCategory?.id || productForm.categoryId.trim(),
        categoryName: selectedCategory?.name || productForm.category.trim(),
        price: Number(productForm.price) || 0,
        mrp: Number(productForm.mrp) || 0,
        discount: Math.max(0, (Number(productForm.mrp) || 0) - (Number(productForm.price) || 0)),
        stock: Number(productForm.stock) || 0,
        images,
        featured: productForm.featured,
        bestSeller: productForm.bestSeller,
        newArrival: productForm.newArrival,
        rating: 0,
        reviewCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        weight: productForm.weight.trim(),
        sku: productForm.sku.trim(),
      };

      if (editingProductId) {
        await ProductService.updateProduct(editingProductId, {
          ...payload,
          updatedAt: new Date(),
        });
        await queryClient.invalidateQueries({ queryKey: ["products"] });
        await queryClient.invalidateQueries({ queryKey: ["homepage"] });
        setProducts((prev) => prev.map((product) => (product.id === editingProductId ? { ...product, ...payload, updatedAt: new Date() } : product)));
        toast.success("Product updated successfully");
      } else {
        const createdId = await ProductService.createProduct(payload);
        const createdProduct: Product = {
          id: createdId,
          ...payload,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await queryClient.invalidateQueries({ queryKey: ["products"] });
        await queryClient.invalidateQueries({ queryKey: ["homepage"] });
        setProducts((prev) => [createdProduct, ...prev]);
        toast.success("Product created successfully");
      }

      resetForm();
      setShowAdd(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save product.";
      setUploadError(message);
      toast.error(message);
    } finally {
      submittingRef.current = false;
      setIsUploading(false);
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search products…" className="w-56 bg-transparent text-sm outline-none" />
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> Add Product
          {showAdd ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {showAdd && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
            {editingProductId ? "Edit Product" : "New Product"}
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Product Name"
              placeholder="e.g. A2 Cow Desi Ghee"
              value={productForm.name}
              onChange={(e) => updateProductForm("name", e.target.value)}
            />
            <Field
              label="Description"
              placeholder="Enter product description"
              textarea
              value={productForm.description}
              onChange={(e) => updateProductForm("description", e.target.value)}
            />
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Category
              </span>
              <select
                value={productForm.categoryId}
                onChange={(e) => {
                  const nextCategoryId = e.target.value;
                  const nextCategory = categories.find((category) => category.id === nextCategoryId) ?? null;
                  updateProductForm("categoryId", nextCategoryId);
                  updateProductForm("category", nextCategory?.slug || "");
                }}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">Choose category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Price (₹)"
              placeholder="899"
              type="number"
              value={productForm.price}
              onChange={(e) => updateProductForm("price", e.target.value)}
            />
            <Field
              label="MRP (₹)"
              placeholder="1099"
              type="number"
              value={productForm.mrp}
              onChange={(e) => updateProductForm("mrp", e.target.value)}
            />
            <Field
              label="Stock"
              placeholder="24"
              type="number"
              value={productForm.stock}
              onChange={(e) => updateProductForm("stock", e.target.value)}
            />
            <Field
              label="Weight"
              placeholder="500 ml"
              value={productForm.weight}
              onChange={(e) => updateProductForm("weight", e.target.value)}
            />
            <Field
              label="SKU"
              placeholder="GHEE-500"
              value={productForm.sku}
              onChange={(e) => updateProductForm("sku", e.target.value)}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <input
                type="checkbox"
                checked={productForm.featured}
                onChange={(e) => updateProductForm("featured", e.target.checked)}
                className="h-4 w-4 rounded border-border bg-background"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <input
                type="checkbox"
                checked={productForm.bestSeller}
                onChange={(e) => updateProductForm("bestSeller", e.target.checked)}
                className="h-4 w-4 rounded border-border bg-background"
              />
              Best Seller
            </label>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <input
                type="checkbox"
                checked={productForm.newArrival}
                onChange={(e) => updateProductForm("newArrival", e.target.checked)}
                className="h-4 w-4 rounded border-border bg-background"
              />
              New Arrival
            </label>
          </div>
          <div className="mt-5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Product Images (up to 5)
            </label>
            <div className="mt-2">
              <ProductImageUploader
                aspect={1}
                outputWidth={1200}
                outputHeight={1200}
                onFilesChange={setProductFiles}
              />
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            {formErrors.length > 0 ? (
              <div className="rounded-xl border border-sale/30 bg-sale/10 p-3 text-sm text-sale">
                {formErrors.map((message) => <div key={message}>{message}</div>)}
              </div>
            ) : null}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  resetForm();
                  setShowAdd(false);
                }}
                className="rounded-full border border-border px-4 py-2 text-sm font-bold hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={isUploading || isSaving}
                className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUploading ? "Uploading..." : isSaving ? "Saving..." : editingProductId ? "Save Changes" : "Save Product"}
              </button>
            </div>
            {uploadError ? (
              <p className="text-right text-sm text-sale">{uploadError}</p>
            ) : null}
            {!uploadError && uploadedImages.length > 0 ? (
              <p className="text-right text-sm text-muted-foreground">
                Uploaded {uploadedImages.length} image{uploadedImages.length > 1 ? "s" : ""}.
              </p>
            ) : null}
          </div>
        </div>
      )}

      {editingImages && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
              Edit images — {currentEditingProduct?.name}
            </h3>
            <button
              onClick={() => {
                setEditingImages(null);
                resetImageManager();
              }}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
          <ProductImageUploader
            aspect={1}
            outputWidth={1200}
            outputHeight={1200}
            initial={Array.from({ length: 5 }, (_, index) => currentEditingProduct?.images[index]?.url ?? null)}
            onChange={(nextImages) => setImageDraft(nextImages)}
            onFilesChange={(nextFiles) => setImageFiles(nextFiles)}
          />
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditingImages(null);
                  resetImageManager();
                }}
                className="rounded-full border border-border px-4 py-2 text-sm font-bold hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveImages}
                disabled={isUpdatingImages}
                className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUpdatingImages ? "Saving..." : "Save Images"}
              </button>
            </div>
            {imageManagementError ? (
              <p className="text-right text-sm text-sale">{imageManagementError}</p>
            ) : null}
          </div>
        </div>
      )}

      {isLoadingProducts ? (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Loading products...
        </div>
      ) : (
      <DataTable
        columns={[
          {
            key: "name",
            label: "Product",
            render: (p) => (
              <div className="flex items-center gap-3">
                <ImagePlaceholder
                  src={p.images?.[0]?.url || ""}
                  alt={p.name}
                  className="h-10 w-10"
                  rounded="rounded-lg"
                />
                <div className="min-w-0">
                  <div className="truncate font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.sku}</div>
                </div>
              </div>
            ),
          },
          { key: "category", label: "Category" },
          { key: "price", label: "Price", render: (p) => inr(p.price) },
          { key: "stock", label: "Stock", render: (p) => (
            <span className={p.stock < 10 ? "font-bold text-sale" : "font-semibold"}>{p.stock}</span>
          ) },
          {
            key: "flags",
            label: "Tags",
            render: (p) => (
              <div className="flex flex-wrap gap-1">
                {p.bestSeller && <Tag c="bg-turmeric/30">Best</Tag>}
                {p.newArrival && <Tag c="bg-leaf/30">New</Tag>}
                {p.featured && <Tag c="bg-primary/15 text-primary">Featured</Tag>}
              </div>
            ),
          },
          {
            key: "actions",
            label: "",
            className: "text-right",
            render: (p) => (
              <div className="flex justify-end gap-1">
                <button
                  onClick={() => handleOpenImageManager(p.id)}
                  title="Manage images"
                  className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
                >
                  <Images className="h-4 w-4" />
                </button>
                <button
                  onClick={() => populateForm(p)}
                  className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <AlertDialog open={deleteTargetId === p.id} onOpenChange={(open) => setDeleteTargetId(open ? p.id : null)}>
                  <AlertDialogTrigger asChild>
                    <button className="grid h-8 w-8 place-items-center rounded-full text-sale hover:bg-sale/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete product?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. The product will be removed from Firestore.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteProduct(p.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ),
          },
        ]}
        rows={products}
      />
      )}
    </div>
  );
}

class AdminProductsErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-sale/30 bg-sale/10 p-6 text-sm text-sale">
          Something went wrong while loading the admin products screen.
        </div>
      );
    }

    return this.props.children;
  }
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function Tag({ children, c }: { children: React.ReactNode; c: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c}`}>{children}</span>;
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  textarea = false,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>

      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="mt-1 min-h-24 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      )}
    </label>
  );
}