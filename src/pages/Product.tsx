import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Heart, Star } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import shoeFeatured from "@/assets/shoe-featured.png";
import shoeOrange from "@/assets/shoe-orange.png";
import shoeBlue from "@/assets/shoe-blue.png";
import shoePurple from "@/assets/shoe-purple.png";

const Product = () => {
  const { id } = useParams();
  const [selectedColor, setSelectedColor] = useState("orange");
  const [selectedSize, setSelectedSize] = useState("40");

  const colors = [
    { id: "orange", name: "Orange", value: "bg-orange-500" },
    { id: "blue", name: "Blue", value: "bg-blue-500" },
    { id: "yellow", name: "Yellow", value: "bg-yellow-500" },
    { id: "gray", name: "Gray", value: "bg-gray-400" },
  ];

  const sizes = ["39", "40", "41", "42"];

  const relatedProducts = [
    { id: "1", image: shoeOrange, bgColor: "bg-gradient-to-br from-orange-400 to-orange-300" },
    { id: "2", image: shoePurple, bgColor: "bg-gradient-to-br from-purple-400 to-blue-500" },
    { id: "3", image: shoeBlue, bgColor: "bg-gradient-to-br from-teal-400 to-cyan-400" },
  ];

  return (
    <div className="min-h-screen bg-gradient-coral">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        <div className="bg-gradient-primary rounded-[3rem] p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-foreground/60 hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground/80">Shop / Product details</p>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">Product Details</h1>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <button className="text-foreground font-medium hover:text-primary transition-colors">
                Next Product
              </button>
              <ArrowRight className="w-5 h-5 text-foreground" />
            </div>
          </div>

          <div className="bg-card rounded-[2.5rem] p-8 md:p-12 shadow-product">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Product Image */}
              <div className="space-y-6">
                <div className="bg-gradient-soft rounded-[2rem] p-12 flex items-center justify-center min-h-[400px] relative">
                  <div className="absolute top-8 left-8">
                    <Heart className="w-6 h-6 text-foreground/60 cursor-pointer hover:text-primary transition-colors" />
                  </div>
                  <img 
                    src={shoeFeatured} 
                    alt="Nike Air Max 270"
                    className="w-full max-w-md h-auto object-contain drop-shadow-2xl"
                  />
                </div>
                
                <div className="flex gap-4 justify-center">
                  {[shoeFeatured, shoeFeatured, shoeFeatured].map((img, idx) => (
                    <div key={idx} className="bg-gradient-soft rounded-2xl p-4 w-20 h-20 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                      <img src={img} alt="" className="w-full h-auto object-contain" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    Nike Air Max 270
                  </h2>
                  <h3 className="text-2xl font-semibold text-foreground/80 mb-4">
                    tc Chuck Taylors
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Nike's Air Force 1s have been running the streets since the early 80s, 
                    making this one of the most iconic sneakers this year.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <span className="text-foreground font-semibold">4.5 (100)</span>
                  <span className="text-muted-foreground">Reviews</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-foreground font-semibold mb-2 block">Color:</label>
                    <div className="flex gap-3">
                      {colors.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => setSelectedColor(color.id)}
                          className={`w-10 h-10 rounded-full ${color.value} ${
                            selectedColor === color.id ? 'ring-4 ring-primary ring-offset-2' : ''
                          } transition-all`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-foreground font-semibold mb-2 block">Size:</label>
                    <div className="flex gap-3">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-6 py-2 rounded-full font-semibold transition-all ${
                            selectedSize === size
                              ? 'bg-foreground text-background'
                              : 'bg-muted text-foreground hover:bg-foreground/10'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <p className="text-4xl font-bold text-foreground">$290.00</p>
                  <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 py-6 text-lg font-semibold">
                    Add to cart
                  </Button>
                </div>
              </div>
            </div>

            {/* Related Products */}
            <div className="mt-16">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-bold text-foreground">Related Product</h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-foreground font-medium">Showing 1-12 of 48 results</span>
                  <span className="text-foreground/70">Default sorting</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`}>
                    <div className="bg-background rounded-[2rem] p-6 shadow-card hover:shadow-product transition-all duration-300 hover:scale-105">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-card rounded-full p-2 cursor-pointer hover:bg-muted transition-colors">
                          <Heart className="w-4 h-4 text-foreground" />
                        </div>
                      </div>
                      
                      <div className={`${product.bgColor} rounded-[1.5rem] p-8 flex items-center justify-center min-h-[160px]`}>
                        <img 
                          src={product.image} 
                          alt="Related product"
                          className="w-full h-auto object-contain drop-shadow-2xl"
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
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

export default Product;
