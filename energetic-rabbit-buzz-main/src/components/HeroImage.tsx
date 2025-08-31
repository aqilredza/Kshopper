import React from "react";

const HeroImage = () => (
  <img
    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80"
    alt="Gyeongbokgung Palace, Seoul, Korea"
    className="hidden md:block absolute right-0 top-0 h-[400px] w-auto object-cover rounded-bl-3xl shadow-xl"
    style={{ zIndex: 1 }}
  />
);

export default HeroImage;
