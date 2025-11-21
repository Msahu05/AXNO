import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  image: string;
  bgColor: string;
}

const ProductCard = ({ id, name, price, image, bgColor }: ProductCardProps) => {
  return (
    <Link to={`/product/${id}`}>
      <div className="bg-card rounded-[2rem] p-6 shadow-card hover:shadow-product transition-all duration-300 hover:scale-105 group">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-background/50 rounded-full p-2 cursor-pointer hover:bg-background transition-colors">
            <Heart className="w-4 h-4 text-foreground" />
          </div>
          <div className="bg-background/50 rounded-full p-2 cursor-pointer hover:bg-background transition-colors">
            <ShoppingCart className="w-4 h-4 text-foreground" />
          </div>
        </div>
        
        <div className={`${bgColor} rounded-[1.5rem] p-8 mb-4 flex items-center justify-center min-h-[200px] relative overflow-hidden`}>
          <img 
            src={image} 
            alt={name}
            className="w-full h-auto object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-muted-foreground">Popular Shoe Trends</h3>
          <p className="text-2xl font-bold text-foreground">{price}</p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
