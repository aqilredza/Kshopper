import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CustomRequestConfirmation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-green-500 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Thank You for Your Order!</h1>
        
        <p className="text-lg text-gray-600 mb-2">
          The admin team has received your request and will review it shortly.
        </p>
        
        <p className="text-lg text-gray-600 mb-8">
          We will provide you with an update via WhatsApp on your items.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate("/")} 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            Continue Shopping
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate("/account")}
            className="px-6 py-3 font-medium rounded-lg transition"
          >
            View My Requests
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomRequestConfirmation;