import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Plus, Edit, Trash2, Package } from "lucide-react";
import { AddOn, InsertAddOn, insertAddOnSchema } from "@shared/schema";
import { z } from "zod";

// Extend the insert schema to handle string input that needs conversion
const addOnFormSchema = insertAddOnSchema.extend({
  additionalPrice: z.string().min(1, "Additional price is required").transform((val) => parseFloat(val)),
});

type AddOnFormData = z.infer<typeof addOnFormSchema>;

export default function AdminAddons() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editingAddOn, setEditingAddOn] = useState<AddOn | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form setup with zodResolver
  const form = useForm<AddOnFormData>({
    resolver: zodResolver(addOnFormSchema),
    defaultValues: {
      name: "",
      additionalPrice: "0",
    },
  });

  // Check admin authentication
  const { data: adminStatus, isLoading: authLoading } = useQuery<{ isAdmin: boolean; adminEmail?: string }>({
    queryKey: ['/api/admin/status'],
    retry: false,
  });

  // Fetch add-ons
  const { data: addons, isLoading: addonsLoading } = useQuery<AddOn[]>({
    queryKey: ['/api/admin/addons'],
    enabled: !!adminStatus?.isAdmin,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !adminStatus?.isAdmin) {
      setLocation("/admin");
    }
  }, [adminStatus, authLoading, setLocation]);

  // Create add-on mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertAddOn) => {
      const response = await apiRequest('POST', '/api/admin/addons', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Add-on created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/addons'] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create add-on.",
        variant: "destructive",
      });
    },
  });

  // Update add-on mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertAddOn }) => {
      const response = await apiRequest('PUT', `/api/admin/addons/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Add-on updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/addons'] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update add-on.",
        variant: "destructive",
      });
    },
  });

  // Delete add-on mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/addons/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Add-on deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/addons'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete add-on.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddOnFormData) => {
    if (editingAddOn) {
      updateMutation.mutate({ id: editingAddOn.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (addon: AddOn) => {
    setEditingAddOn(addon);
    form.reset({
      name: addon.name,
      additionalPrice: addon.additionalPrice.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (addon: AddOn) => {
    if (confirm(`Are you sure you want to delete "${addon.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(addon.id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAddOn(null);
    form.reset({
      name: "",
      additionalPrice: "0",
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-addons-title">
                  Add-ons Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage product add-ons and extra options
                </p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-addon">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Add-on
                </Button>
              </DialogTrigger>
              <DialogContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingAddOn ? "Edit Add-on" : "Add New Add-on"}
                    </DialogTitle>
                    <DialogDescription>
                      Create or edit an add-on that customers can choose for their products.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Add-on Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Extra Frosting, Chocolate Drizzle"
                              data-testid="input-addon-name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="additionalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Price (LKR)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              data-testid="input-addon-price"
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
                      data-testid="button-save-addon"
                    >
                      {(createMutation.isPending || updateMutation.isPending) 
                        ? "Saving..." 
                        : editingAddOn ? "Update" : "Create"
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
        {addonsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading add-ons...</p>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Add-ons ({addons?.length || 0})</span>
              </CardTitle>
              <CardDescription>
                Manage product add-ons and customization options
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!addons || addons.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No add-ons found.</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first add-on
                  </Button>
                </div>
              ) : (
                <Table data-testid="table-addons">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Additional Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {addons.map((addon) => (
                      <TableRow key={addon.id} data-testid={`row-addon-${addon.id}`}>
                        <TableCell className="font-medium">{addon.name}</TableCell>
                        <TableCell>LKR {addon.additionalPrice}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(addon)}
                              data-testid={`button-edit-${addon.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(addon)}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-${addon.id}`}
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