import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-6">About Us</h1>
      <p className="text-lg text-gray-700 mb-8">
        Welcome to our platform! We are dedicated to bringing you the best products and services.
        Our mission is to connect you with unique items and provide a seamless shopping experience.
      </p>
      <Link to="/">
        <Button>Go to Home</Button>
      </Link>
    </div>
  );
};

export default About;