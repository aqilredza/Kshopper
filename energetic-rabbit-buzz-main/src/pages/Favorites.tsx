import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Favorites = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="text-4xl font-black uppercase mb-4">My Favorites</h1>
      <p className="text-lg text-muted-foreground mb-8">This is where your favorite items will appear.</p>
      <Button asChild>
        <Link to="/">Start Browsing</Link>
      </Button>
    </div>
  );
};

export default Favorites;