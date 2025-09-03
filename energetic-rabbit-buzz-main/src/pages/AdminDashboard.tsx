import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AdminDashboard = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black uppercase text-center mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Manage Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Review all submitted orders from users.</p>
            <Button asChild>
              <Link to="/admin/manage-orders">Manage Orders</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Manage product categories.</p>
            <Button asChild>
              <Link to="/admin/categories">Go to Categories</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Hot Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Manage homepage hot items.</p>
            <Button asChild>
              <Link to="/admin/hot-items">Manage Hot Items</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Custom Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Review and manage user requests.</p>
            <Button asChild>
              <Link to="/admin/custom-requests">Review Requests</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manage Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">View and manage all products.</p>
            <Button asChild>
              <Link to="/admin/products">Manage Products</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>About Page</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Edit About Us page content and profile image.</p>
            <Button asChild>
              <Link to="/admin/about">Edit About Page</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;