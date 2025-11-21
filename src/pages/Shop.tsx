import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import shoeOrange from "@/assets/shoe-orange.png";
import shoeBlue from "@/assets/shoe-blue.png";
import shoePurple from "@/assets/shoe-purple.png";
import shoeGreen from "@/assets/shoe-green.png";

const Shop = () => {
  const products = [
    { id: "1", name: "Popular Shoe Trends", price: "$234.00", image: shoeOrange, bgColor: "bg-gradient-to-br from-orange-400 to-orange-300" },
    { id: "2", name: "Popular Shoe Trends", price: "$234.00", image: shoePurple, bgColor: "bg-gradient-to-br from-purple-400 to-blue-500" },
    { id: "3", name: "Popular Shoe Trends", price: "$234.00", image: shoeGreen, bgColor: "bg-gradient-to-br from-green-400 to-teal-400" },
    { id: "4", name: "Popular Shoe Trends", price: "$234.00", image: shoeBlue, bgColor: "bg-gradient-to-br from-teal-400 to-cyan-400" },
    { id: "5", name: "Popular Shoe Trends", price: "$234.00", image: shoeOrange, bgColor: "bg-gradient-to-br from-orange-500 to-orange-400" },
    { id: "6", name: "Popular Shoe Trends", price: "$234.00", image: shoePurple, bgColor: "bg-gradient-to-br from-purple-500 to-indigo-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-coral">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        <div className="bg-gradient-primary rounded-[3rem] p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground/80">/ Product</p>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">Shop</h1>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-foreground font-medium">Showing 1-12 of 48 results</span>
              <span className="text-foreground/70">Default sorting</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          {/* Vertical side text */}
          <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden lg:block">
            <p className="text-sm font-medium text-foreground/60 -rotate-90 whitespace-nowrap">
              Make an original design
            </p>
          </div>
          
          <div className="fixed right-8 top-1/2 -translate-y-1/2 hidden lg:block">
            <p className="text-sm font-medium text-foreground/60 rotate-90 whitespace-nowrap">
              We believe in your potential
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Shop;
