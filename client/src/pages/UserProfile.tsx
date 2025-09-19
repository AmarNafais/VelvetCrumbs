import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { updateUserProfileSchema, UpdateUserProfile } from "@shared/schema";
import { User, Mail, Phone, MapPin, Calendar, UserCheck, Edit, Save, Home } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

type ProfileFormData = UpdateUserProfile;

export default function UserProfile() {
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const { user, updateProfileMutation } = useAuth();

  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      dateOfBirth: user?.dateOfBirth || "",
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        dateOfBirth: user.dateOfBirth || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }
  };

  // Don't render if user is not logged in (will redirect)
  if (!user) {
    return null;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not provided";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-profile-title">
              Welcome, {user.firstName || user.username}!
            </h1>
            <p className="text-muted-foreground">
              Manage your personal information and account settings
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/")}
            className="inline-flex items-center"
            data-testid="button-back-home"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex justify-center items-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4" />
              <span>Member since {new Date(user.createdAt || "").toLocaleDateString()}</span>
            </Badge>
            {user.isAdmin && (
              <Badge className="bg-primary text-primary-foreground">
                <span>Administrator</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Account Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Account Information</span>
                </CardTitle>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    data-testid="button-edit-profile"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              <CardDescription>
                Your basic account and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isEditing ? (
                // View Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                      <p className="text-foreground" data-testid="text-username">{user.username}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="text-foreground" data-testid="text-email">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">First Name</Label>
                      <p className="text-foreground" data-testid="text-firstName">{user.firstName || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Last Name</Label>
                      <p className="text-foreground" data-testid="text-lastName">{user.lastName || "Not provided"}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                    <p className="text-foreground flex items-center space-x-2" data-testid="text-phone">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{user.phone || "Not provided"}</span>
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                    <p className="text-foreground flex items-start space-x-2" data-testid="text-address">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{user.address || "Not provided"}</span>
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                    <p className="text-foreground flex items-center space-x-2" data-testid="text-dateOfBirth">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(user.dateOfBirth)}</span>
                    </p>
                  </div>
                </div>
              ) : (
                // Edit Mode
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Enter your first name"
                        data-testid="input-edit-firstName"
                        {...form.register("firstName")}
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Enter your last name"
                        data-testid="input-edit-lastName"
                        {...form.register("lastName")}
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        data-testid="input-edit-email"
                        {...form.register("email")}
                      />
                    </div>
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        className="pl-10"
                        data-testid="input-edit-phone"
                        {...form.register("phone")}
                      />
                    </div>
                    {form.formState.errors.phone && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                      <Input
                        id="address"
                        type="text"
                        placeholder="Enter your address"
                        className="pl-10"
                        data-testid="input-edit-address"
                        {...form.register("address")}
                      />
                    </div>
                    {form.formState.errors.address && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.address.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        className="pl-10"
                        data-testid="input-edit-dateOfBirth"
                        {...form.register("dateOfBirth")}
                      />
                    </div>
                    {form.formState.errors.dateOfBirth && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      data-testid="button-save-profile"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        form.reset();
                      }}
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your account and access key features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setLocation("/cart")}
                data-testid="button-view-cart"
              >
                <User className="h-4 w-4 mr-2" />
                View Shopping Cart
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setLocation("/products")}
                data-testid="button-browse-products"
              >
                <User className="h-4 w-4 mr-2" />
                Browse Products
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setLocation("/")}
                data-testid="button-home"
              >
                <User className="h-4 w-4 mr-2" />
                Back to Home
              </Button>

              <Separator />

              <div className="text-sm text-muted-foreground">
                <p><strong>Account Security:</strong></p>
                <p>Your account is protected with secure authentication. Contact support if you need to change your username or password.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}