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
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Plus, Edit, Trash2, Package } from "lucide-react";
import { Category, InsertCategory, insertCategorySchema } from "@shared/schema";

export default function AdminCollections() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form setup with zodResolver
  const form = useForm<InsertCategory>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "",
      coverImage: "",
      slug: "",
      itemCount: 0,
    },
  });

  // Check admin authentication
  const { data: adminStatus, isLoading: authLoading } = useQuery({
    queryKey: ['/api/admin/status'],
    retry: false,
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading, refetch } = useQuery<Category[]>({
    queryKey: ['/api/admin/categories'],
    enabled: !!adminStatus?.isAdmin,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !adminStatus?.isAdmin) {
      setLocation("/admin");
    }
  }, [adminStatus, authLoading, setLocation]);

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      const response = await apiRequest('POST', '/api/admin/categories', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Collection created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create collection.",
        variant: "destructive",
      });
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertCategory }) => {
      const response = await apiRequest('PUT', `/api/admin/categories/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Collection updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update collection.",
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/categories/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Collection deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/categories'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete collection.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCategory) => {
    // Generate slug from name if not provided
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const submitData = { ...data, slug };
    
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description || "",
      icon: category.icon,
      coverImage: category.coverImage || "",
      slug: category.slug,
      itemCount: category.itemCount,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    if (confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(category.id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    form.reset({
      name: "",
      description: "",
      icon: "",
      coverImage: "",
      slug: "",
      itemCount: 0,
    });
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-collections-title">
                  Collections Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage product categories and collections
                </p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-collection">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Collection
                </Button>
              </DialogTrigger>
              <DialogContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                      <DialogTitle>
                        {editingCategory ? "Edit Collection" : "Add New Collection"}
                      </DialogTitle>
                      <DialogDescription>
                        Create or edit a product collection with details and cover image.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Collection Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Premium Cakes"
                                data-testid="input-collection-name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief description of the collection"
                                data-testid="textarea-collection-description"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Icon Class</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., fas fa-birthday-cake"
                                data-testid="input-collection-icon"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="coverImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cover Image URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Image URL from Imgur or other service"
                                data-testid="input-collection-cover"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL Slug (optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Auto-generated from name if left empty"
                                data-testid="input-collection-slug"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createMutation.isPending || updateMutation.isPending}
                        data-testid="button-save-collection"
                      >
                        {(createMutation.isPending || updateMutation.isPending) 
                          ? "Saving..." 
                          : editingCategory ? "Update" : "Create"
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
        {categoriesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading collections...</p>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Collections ({categories?.length || 0})</span>
              </CardTitle>
              <CardDescription>
                Manage your product collections and categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!categories || categories.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No collections found.</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first collection
                  </Button>
                </div>
              ) : (
                <Table data-testid="table-collections">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id} data-testid={`row-collection-${category.id}`}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                        <TableCell className="text-sm text-gray-500">{category.slug}</TableCell>
                        <TableCell>{category.itemCount}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(category)}
                              data-testid={`button-edit-${category.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(category)}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-${category.id}`}
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
    </div>
  );
}