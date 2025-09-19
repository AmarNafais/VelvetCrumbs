import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, ShoppingCart, Eye, Trash2 } from "lucide-react";
import { Order as BaseOrder, OrderItem as BaseOrderItem, Product } from "@shared/schema";

// Define interface matching the API response structure
interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  product: {
    id: string;
    name: string;
    image: string;
  };
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: string;
  status: 'placed' | 'in_progress' | 'delivered' | 'completed' | 'canceled';
  createdAt: string;
  items: OrderItem[];
}

const statusColors = {
  placed: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  delivered: "bg-green-100 text-green-800",
  completed: "bg-green-100 text-green-800",
  canceled: "bg-red-100 text-red-800",
};

export default function AdminOrders() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check admin authentication
  const { data: adminStatus, isLoading: authLoading } = useQuery<{ isAdmin: boolean; adminEmail?: string }>({
    queryKey: ['/api/admin/status'],
    retry: false,
  });

  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    enabled: !!adminStatus?.isAdmin,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !adminStatus?.isAdmin) {
      setLocation("/admin");
    }
  }, [adminStatus, authLoading, setLocation]);

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest('PUT', `/api/admin/orders/${id}/status`, { status });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/admin/orders/${id}`);
      if (!response.ok) {
        throw new Error('Failed to delete order');
      }
      return;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete order.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleDeleteOrder = (orderId: string, customerName: string) => {
    if (window.confirm(`Are you sure you want to delete the order for ${customerName}? This action cannot be undone.`)) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: Order['status']) => {
    const colorClass = statusColors[status] || "bg-gray-100 text-gray-800";
    return (
      <Badge className={`${colorClass} capitalize`}>
        {status.replace('_', ' ')}
      </Badge>
    );
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-orders-title">
                  Orders Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Track and manage customer orders
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {ordersLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading orders...</p>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Orders ({orders?.length || 0})</span>
              </CardTitle>
              <CardDescription>
                Track and manage customer orders and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!orders || orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No orders found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status Filter */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-sm font-medium">Filter by status:</span>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-100 text-blue-800">Placed ({orders.filter(o => o.status === 'placed').length})</Badge>
                      <Badge className="bg-yellow-100 text-yellow-800">In Progress ({orders.filter(o => o.status === 'in_progress').length})</Badge>
                      <Badge className="bg-green-100 text-green-800">Delivered ({orders.filter(o => o.status === 'delivered').length})</Badge>
                      <Badge className="bg-green-100 text-green-800">Completed ({orders.filter(o => o.status === 'completed').length})</Badge>
                      <Badge className="bg-red-100 text-red-800">Canceled ({orders.filter(o => o.status === 'canceled').length})</Badge>
                    </div>
                  </div>

                  <Table data-testid="table-orders">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                          <TableCell className="font-mono text-sm">
                            {order.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customerName}</div>
                              <div className="text-sm text-gray-500">{order.customerEmail}</div>
                              {order.customerPhone && (
                                <div className="text-sm text-gray-500">{order.customerPhone}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              {order.items?.map((item, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  {item.product?.image && (
                                    <img
                                      src={item.product.image}
                                      alt={item.product.name}
                                      className="w-12 h-12 object-cover rounded"
                                      data-testid={`order-item-image-${item.id}`}
                                    />
                                  )}
                                  <div className="text-sm">
                                    {item.quantity}x {item.product?.name || 'Unknown Product'}
                                  </div>
                                </div>
                              )) || <span className="text-gray-500">No items</span>}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            LKR {order.total}
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Select
                                value={order.status}
                                onValueChange={(value) => handleStatusChange(order.id, value)}
                                disabled={updateStatusMutation.isPending}
                              >
                                <SelectTrigger className="w-[130px]" data-testid={`select-status-${order.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="placed">Placed</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="canceled">Canceled</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteOrder(order.id, order.customerName)}
                                disabled={deleteOrderMutation.isPending}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                data-testid={`button-delete-order-${order.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}