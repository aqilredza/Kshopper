import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HelpCenter = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="text-4xl font-black uppercase mb-4">Help Center</h1>
      <p className="text-lg text-muted-foreground mb-8">Find answers to your questions here.</p>
      <Button asChild>
        <Link to="/">Go to Home</Link>
      </Button>
    </div>
  );
};

export default HelpCenter;