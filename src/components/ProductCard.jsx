import { useState } from "react";
import { ShoppingCart, Heart, ExternalLink } from "lucide-react";
import Button from 'components/ui/Button';

export default function ProductCard({ product, onAddToCart }) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="group relative bg-white/5 border border-white/10 rounded-sm overflow-hidden hover:border-cyan-500/30 transition-all duration-300">
      {/* Product Image */}
      <div className="aspect-square overflow-hidden bg-black/50">
        {!imageError ? (
          <img
            src={product?.image || "/assets/images/no_image.png"}
            alt={product?.title || "Product image"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/10 to-purple-500/10">
            <span className="text-4xl text-white/20">🎵</span>
          </div>
        )}

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
          >
            <ExternalLink className="h-5 w-5" />
          </Button>
        </div>

        {/* Badge */}
        {product?.badge && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-cyan-500 text-black rounded-full">
              {product?.badge}
            </span>
          </div>
        )}
      </div>
      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-white font-bold mb-1 truncate">{product?.title || "Untitled"}</h3>
        <p className="text-gray-400 text-sm mb-3 truncate">{product?.artist || product?.category || "Unknown"}</p>

        <div className="flex items-center justify-between">
          <span className="text-cyan-500 font-bold text-lg">
            ${product?.price?.toFixed(2) || "0.00"}
          </span>
          <Button
            size="sm"
            className="bg-cyan-500 text-black hover:bg-cyan-400 font-bold"
            onClick={() => onAddToCart?.(product)}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}