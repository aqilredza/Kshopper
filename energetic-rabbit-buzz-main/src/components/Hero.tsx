const Hero = () => {
  return (
    <div className="bg-white border-t-4 border-hot-pink border-b-4 border-sky-blue">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-black uppercase text-foreground">
          Your Gateway to Korea
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover the best of Korean cuisine, right at your doorstep. Authentic flavors, unbeatable prices.
        </p>
      </div>
    </div>
  );
};

export default Hero;