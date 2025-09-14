import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Plus, Edit, Trash2, Package, Image, Link } from "lucide-react";
import { 
  Product, 
  Category, 
  AddOn, 
  ProductImage, 
  InsertProduct, 
  InsertProductImage, 
  insertProductSchema 
} from "@shared/schema";
import { z } from "zod";

// Extend the insert schema to handle string inputs that need conversion
const productFormSchema = insertProductSchema.extend({
  price: z.string().min(1, "Price is required").transform((val) => parseFloat(val)),
  originalPrice: z.string().optional().transform((val) => val ? parseFloat(val) : null),
  rating: z.string().transform((val) => parseFloat(val) || 5.0),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export default function AdminProducts() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showImagesDialog, setShowImagesDialog] = useState(false);
  const [showAddOnsDialog, setShowAddOnsDialog] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Form setup with zodResolver
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "0",
      originalPrice: "",
      image: "",
      duration: "",
      categoryId: "",
      featured: false,
      inStock: true,
      rating: "5.0",
      tags: [],
    },
  });

  // Check admin authentication
  const { data: adminStatus, isLoading: authLoading } = useQuery({
    queryKey: ['/api/admin/status'],
    retry: false,
  });

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/admin/products'],
    enabled: !!adminStatus?.isAdmin,
  });

  // Fetch categories for dropdown
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/admin/categories'],
    enabled: !!adminStatus?.isAdmin,
  });

  // Fetch add-ons for association
  const { data: addons } = useQuery<AddOn[]>({
    queryKey: ['/api/admin/addons'],
    enabled: !!adminStatus?.isAdmin,
  });

  // Fetch product images
  const { data: productImages } = useQuery<ProductImage[]>({
    queryKey: ['/api/admin/product-images', selectedProduct?.id],
    enabled: !!adminStatus?.isAdmin && !!selectedProduct,
  });

  // Fetch product add-ons associations
  const { data: productAddOns } = useQuery<{productId: string, addOnId: string, addOn: AddOn}[]>({
    queryKey: ['/api/admin/product-addons', selectedProduct?.id],
    enabled: !!adminStatus?.isAdmin && !!selectedProduct,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !adminStatus?.isAdmin) {
      setLocation("/admin");
    }
  }, [adminStatus, authLoading, setLocation]);

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const response = await apiRequest('POST', '/api/admin/products', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product.",
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertProduct }) => {
      const response = await apiRequest('PUT', `/api/admin/products/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product.",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/products/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      image: product.image,
      duration: product.duration || "",
      categoryId: product.categoryId,
      featured: product.featured,
      inStock: product.inStock,
      rating: product.rating.toString(),
      tags: product.tags || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(product.id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    form.reset({
      name: "",
      description: "",
      price: "0",
      originalPrice: "",
      image: "",
      duration: "",
      categoryId: "",
      featured: false,
      inStock: true,
      rating: "5.0",
      tags: [],
    });
  };

  // Image management mutations
  const addImageMutation = useMutation({
    mutationFn: async ({ productId, url, position }: { productId: string; url: string; position: number }) => {
      const response = await apiRequest('POST', '/api/admin/product-images', { productId, url, position });
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Image added successfully." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/product-images'] });
      setNewImageUrl("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to add image.", variant: "destructive" });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      await apiRequest('DELETE', `/api/admin/product-images/${imageId}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Image deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/product-images'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete image.", variant: "destructive" });
    },
  });

  // Product-addon association mutations
  const addProductAddOnMutation = useMutation({
    mutationFn: async ({ productId, addOnId }: { productId: string; addOnId: string }) => {
      const response = await apiRequest('POST', '/api/admin/product-addons', { productId, addOnId });
      return await response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Add-on associated successfully." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/product-addons'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to associate add-on.", variant: "destructive" });
    },
  });

  const removeProductAddOnMutation = useMutation({
    mutationFn: async (associationId: string) => {
      await apiRequest('DELETE', `/api/admin/product-addons/${associationId}`);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Add-on removed successfully." });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/product-addons'] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to remove add-on.", variant: "destructive" });
    },
  });

  const handleAddImage = () => {
    if (!selectedProduct || !newImageUrl.trim()) return;
    const position = (productImages?.length || 0);
    addImageMutation.mutate({ productId: selectedProduct.id, url: newImageUrl.trim(), position });
  };

  const handleAddProductAddOn = (addOnId: string) => {
    if (!selectedProduct) return;
    addProductAddOnMutation.mutate({ productId: selectedProduct.id, addOnId });
  };

  const getAvailableAddOns = () => {
    if (!addons || !productAddOns) return addons;
    const associatedAddOnIds = productAddOns.map(pa => pa.addOnId);
    return addons.filter(addon => !associatedAddOnIds.includes(addon.id));
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  if (authLoading || !adminStatus?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/admin/dashboard")}
                data-testid="button-back-dashboard"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-products-title">
                  Products Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your product inventory and details
                </p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-product">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                    <DialogDescription>
                      Create or edit a product with details, pricing, and category.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Premium Chocolate Cake"
                                data-testid="input-product-name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-product-category">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories?.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Detailed product description"
                              data-testid="textarea-product-description"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (LKR)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                data-testid="input-product-price"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="originalPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Original Price (optional)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                data-testid="input-product-original-price"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., 15 min prep time"
                                data-testid="input-product-duration"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Image URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Image URL from Imgur or other service"
                              data-testid="input-product-image"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags (comma separated)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., chocolate, premium, celebration"
                              data-testid="input-product-tags"
                              value={field.value?.join(', ') || ''}
                              onChange={(e) => {
                                const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                                field.onChange(tags);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rating</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                data-testid="input-product-rating"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 pt-6">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-product-featured"
                              />
                            </FormControl>
                            <FormLabel>Featured</FormLabel>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="inStock"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 pt-6">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-product-stock"
                              />
                            </FormControl>
                            <FormLabel>In Stock</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-save-product"
                    >
                      {(createMutation.isPending || updateMutation.isPending) 
                        ? "Saving..." 
                        : editingProduct ? "Update" : "Create"
                      }
                    </Button>
                  </DialogFooter>
                </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {productsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading products...</p>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Products ({products?.length || 0})</span>
              </CardTitle>
              <CardDescription>
                Manage your product inventory and details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!products || products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No products found.</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first product
                  </Button>
                </div>
              ) : (
                <Table data-testid="table-products">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                        <TableCell>
                          LKR {product.price}
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              LKR {product.originalPrice}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.featured ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Yes
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                              No
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.inStock ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              In Stock
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                              Out of Stock
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                              data-testid={`button-edit-${product.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowImagesDialog(true);
                              }}
                              data-testid={`button-images-${product.id}`}
                            >
                              <Image className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowAddOnsDialog(true);
                              }}
                              data-testid={`button-addons-${product.id}`}
                            >
                              <Link className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(product)}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-${product.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Image Management Dialog */}
      <Dialog open={showImagesDialog} onOpenChange={setShowImagesDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Images - {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Add or remove images for this product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Add new image */}
            <div className="flex gap-2">
              <Input
                placeholder="Image URL"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                data-testid="input-new-image-url"
              />
              <Button
                onClick={handleAddImage}
                disabled={addImageMutation.isPending || !newImageUrl.trim()}
                data-testid="button-add-image"
              >
                {addImageMutation.isPending ? "Adding..." : "Add Image"}
              </Button>
            </div>
            
            {/* Existing images */}
            <div className="space-y-2">
              <h4 className="font-medium">Existing Images</h4>
              {productImages && productImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {productImages.map((image, index) => (
                    <div key={image.id} className="border rounded p-4 space-y-2" data-testid={`image-item-${index}`}>
                      <img 
                        src={image.url} 
                        alt={`Product image ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.png';
                        }}
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Position: {image.position}</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteImageMutation.mutate(image.id)}
                          disabled={deleteImageMutation.isPending}
                          data-testid={`button-delete-image-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No additional images added yet.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImagesDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Add-ons Association Dialog */}
      <Dialog open={showAddOnsDialog} onOpenChange={setShowAddOnsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Add-ons - {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              Associate add-ons with this product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Available add-ons to associate */}
            <div className="space-y-2">
              <h4 className="font-medium">Available Add-ons</h4>
              {addons && addons.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {addons
                    .filter(addon => !productAddOns?.some(pa => pa.addOnId === addon.id))
                    .map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between p-3 border rounded" data-testid={`available-addon-${addon.id}`}>
                      <div>
                        <span className="font-medium">{addon.name}</span>
                        <span className="text-sm text-gray-500 ml-2">+LKR {addon.additionalPrice}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddProductAddOn(addon.id)}
                        disabled={addProductAddOnMutation.isPending}
                        data-testid={`button-add-addon-${addon.id}`}
                      >
                        {addProductAddOnMutation.isPending ? "Adding..." : "Add"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No available add-ons to associate.</p>
              )}
            </div>
            
            {/* Associated add-ons */}
            <div className="space-y-2">
              <h4 className="font-medium">Associated Add-ons</h4>
              {productAddOns && productAddOns.length > 0 ? (
                <div className="space-y-2">
                  {productAddOns.map((association) => (
                    <div key={association.addOnId} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded" data-testid={`associated-addon-${association.addOnId}`}>
                      <div>
                        <span className="font-medium">{association.addOn.name}</span>
                        <span className="text-sm text-gray-500 ml-2">+LKR {association.addOn.additionalPrice}</span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeProductAddOnMutation.mutate(`${association.productId}-${association.addOnId}`)}
                        disabled={removeProductAddOnMutation.isPending}
                        data-testid={`button-remove-addon-${association.addOnId}`}
                      >
                        {removeProductAddOnMutation.isPending ? "Removing..." : "Remove"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No add-ons associated with this product yet.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddOnsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}