import { Card, CardContent } from "./ui/card";

const testimonials = [
  { quote: "Amazing service! I got my favorite snacks delivered so fast. Highly recommend!", author: "Aisha, Kuala Lumpur" },
  { quote: "Finally, a reliable way to get Korean beauty products in Malaysia. The personal shopper notes are so helpful.", author: "Mei Ling, Penang" },
  { quote: "I ordered a gift for my friend and it was perfect. The packaging was great and it arrived on time.", author: "Ravi, Johor Bahru" },
];

const Testimonials = () => {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-black uppercase text-center mb-12">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <blockquote className="border-l-2 pl-6 italic">
                  "{testimonial.quote}"
                </blockquote>
                <p className="text-right font-bold mt-4">- {testimonial.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;