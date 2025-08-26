import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Checkout = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="text-4xl font-black uppercase mb-4">Checkout</h1>
      <p className="text-lg text-muted-foreground mb-8">This is the checkout page. Functionality will be added here.</p>
      <Button asChild>
        <Link to="/cart">Back to Cart</Link>
      </Button>
    </div>
  );
};

export default Checkout;