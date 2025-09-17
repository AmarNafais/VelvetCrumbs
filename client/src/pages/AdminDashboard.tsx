import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Users,
  Plus,
  LogOut,
  Search,
  Edit,
  Trash2,
  Filter
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  itemCount: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  featured: boolean;
  inStock: boolean;
}

interface AddOn {
  id: string;
  name: string;
  additionalPrice: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: string;
  status: 'placed' | 'in_progress' | 'delivered' | 'completed' | 'canceled';
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  dateOfBirth: string | null;
  isAdmin: boolean;
  createdAt: string;
}

type TabType = 'dashboard' | 'categories' | 'products' | 'users' | 'addons' | 'orders';

const statusColors = {
  placed: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800", 
  delivered: "bg-green-100 text-green-800",
  completed: "bg-green-100 text-green-800",
  canceled: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // Check admin authentication status
  const { data: adminStatus, isLoading } = useQuery<{ isAdmin: boolean; adminEmail: string }>({
    queryKey: ['/api/admin/status'],
    retry: false,
  });

  // Data queries
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/admin/categories'],
    enabled: !!adminStatus?.isAdmin,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/admin/products'],
    enabled: !!adminStatus?.isAdmin,
  });

  const { data: addons } = useQuery<AddOn[]>({
    queryKey: ['/api/admin/addons'],
    enabled: !!adminStatus?.isAdmin,
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    enabled: !!adminStatus?.isAdmin,
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!adminStatus?.isAdmin,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !adminStatus?.isAdmin) {
      setLocation("/auth");
    }
  }, [adminStatus, isLoading, setLocation]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/logout');
      return await response.json();
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setLocation("/auth");
    },
    onError: (error: any) => {
      toast({
        title: "Logout Error",
        description: error.message || "An error occurred during logout.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!adminStatus?.isAdmin) {
    return null;
  }

  const sidebarItems = [
    {
      key: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      key: 'categories' as TabType,
      label: 'Categories',
      icon: <Tags className="h-5 w-5" />,
    },
    {
      key: 'products' as TabType,
      label: 'Products',
      icon: <Package className="h-5 w-5" />,
    },
    {
      key: 'users' as TabType,
      label: 'Users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      key: 'addons' as TabType,
      label: 'Add-ons',
      icon: <Plus className="h-5 w-5" />,
    },
    {
      key: 'orders' as TabType,
      label: 'Orders',
      icon: <ShoppingCart className="h-5 w-5" />,
    },
  ];

  const getStats = () => ({
    totalCategories: categories?.length || 0,
    totalProducts: products?.length || 0,
    totalAddons: addons?.length || 0,
    totalOrders: orders?.length || 0,
    totalUsers: users?.length || 0,
    adminUsers: users?.filter(u => u.isAdmin).length || 0,
    pendingOrders: orders?.filter(o => o.status === 'placed').length || 0,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories?.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const renderDashboardTab = () => {
    const stats = getStats();
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
          <p className="text-gray-600 dark:text-gray-400">Welcome back, {adminStatus?.adminEmail}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
              <Tags className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCategories}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.adminUsers} admin{stats.adminUsers !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            {orders && orders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 5).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>LKR {order.total}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status]}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500 text-center py-4">No orders found</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCategoriesTab = () => {
    const filteredCategories = categories?.filter(cat => 
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage product categories</p>
          </div>
          <Button onClick={() => setLocation('/admin/collections')} data-testid="button-manage-categories">
            <Plus className="h-4 w-4 mr-2" />
            Manage Categories
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-categories"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Slug</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id} data-testid={`row-category-${category.id}`}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                      <TableCell>{category.itemCount}</TableCell>
                      <TableCell className="text-sm text-gray-500">{category.slug}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderProductsTab = () => {
    const filteredProducts = products?.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage your product inventory</p>
          </div>
          <Button onClick={() => setLocation('/admin/products')} data-testid="button-manage-products">
            <Plus className="h-4 w-4 mr-2" />
            Manage Products
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-products"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                      <TableCell>LKR {product.price}</TableCell>
                      <TableCell>
                        <Badge className={product.featured ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {product.featured ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={product.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderUsersTab = () => {
    const filteredUsers = users?.filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage customer accounts</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-users"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        {user.firstName || user.lastName 
                          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge className={user.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}>
                          {user.isAdmin ? 'Admin' : 'Customer'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {users?.length === 0 ? 'No users found' : 'No users match your search'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAddonsTab = () => {
    const filteredAddons = addons?.filter(addon => 
      addon.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add-ons</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage product add-ons and customizations</p>
          </div>
          <Button onClick={() => setLocation('/admin/addons')} data-testid="button-manage-addons">
            <Plus className="h-4 w-4 mr-2" />
            Manage Add-ons
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search add-ons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-addons"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Additional Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAddons.length > 0 ? (
                  filteredAddons.map((addon) => (
                    <TableRow key={addon.id} data-testid={`row-addon-${addon.id}`}>
                      <TableCell className="font-medium">{addon.name}</TableCell>
                      <TableCell>LKR {addon.additionalPrice}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                      No add-ons found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderOrdersTab = () => {
    const filteredOrders = orders?.filter(order => 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h2>
            <p className="text-gray-600 dark:text-gray-400">Track and manage customer orders</p>
          </div>
          <Button onClick={() => setLocation('/admin/orders')} data-testid="button-manage-orders">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Manage Orders
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-orders"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                      <TableCell className="font-medium">{order.customerName}</TableCell>
                      <TableCell>{order.customerEmail}</TableCell>
                      <TableCell>LKR {order.total}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status]}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardTab();
      case 'categories':
        return renderCategoriesTab();
      case 'products':
        return renderProductsTab();
      case 'users':
        return renderUsersTab();
      case 'addons':
        return renderAddonsTab();
      case 'orders':
        return renderOrdersTab();
      default:
        return renderDashboardTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg border-r">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Velvet Crumbs</p>
        </div>
        
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === item.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              data-testid={`tab-${item.key}`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t">
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            className="w-full justify-start"
            disabled={logoutMutation.isPending}
            data-testid="button-sidebar-logout"
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span>{logoutMutation.isPending ? "Signing out..." : "Logout"}</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {renderTabContent()}
      </div>
    </div>
  );
}