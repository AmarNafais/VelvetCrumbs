import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart, 
  Plus,
  LogOut,
  Settings
} from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check admin authentication status
  const { data: adminStatus, isLoading } = useQuery<{ isAdmin: boolean; adminEmail: string }>({
    queryKey: ['/api/admin/status'],
    retry: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !adminStatus?.isAdmin) {
      setLocation("/admin");
    }
  }, [adminStatus, isLoading, setLocation]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/logout');
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setLocation("/admin");
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

  const dashboardCards = [
    {
      title: "Collections Management",
      description: "Manage product categories and collections",
      icon: <Tags className="h-6 w-6" />,
      action: "Manage Collections",
      href: "/admin/collections",
      testId: "card-collections",
    },
    {
      title: "Products Management",
      description: "Add, edit, and manage products",
      icon: <Package className="h-6 w-6" />,
      action: "Manage Products",
      href: "/admin/products",
      testId: "card-products",
    },
    {
      title: "Add-ons Management",
      description: "Manage product add-ons and customizations",
      icon: <Plus className="h-6 w-6" />,
      action: "Manage Add-ons",
      href: "/admin/addons",
      testId: "card-addons",
    },
    {
      title: "Orders Management",
      description: "View and manage customer orders",
      icon: <ShoppingCart className="h-6 w-6" />,
      action: "Manage Orders",
      href: "/admin/orders",
      testId: "card-orders",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-dashboard-title">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome, {adminStatus?.adminEmail}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="flex items-center space-x-2"
              disabled={logoutMutation.isPending}
              data-testid="button-admin-logout"
            >
              <LogOut className="h-4 w-4" />
              <span>{logoutMutation.isPending ? "Signing out..." : "Logout"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {dashboardCards.map((card, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" data-testid={card.testId}>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {card.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {card.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setLocation(card.href)}
                  className="w-full"
                  data-testid={`button-${card.testId.replace('card-', '')}`}
                >
                  {card.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats or Additional Content */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>System Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Welcome to the Velvet Crumbs admin panel. Use the management cards above to:
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Manage product collections and categories</li>
                <li>• Add, edit, and organize products with multiple images</li>
                <li>• Configure add-ons and product customizations</li>
                <li>• Monitor and update order statuses</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}