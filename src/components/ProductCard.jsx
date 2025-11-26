import { memo } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

const ProductCard = memo(({ id, name, category, price, originalPrice, image, accent, onView, onAdd, onWishlist }) => {
  return (
    <article className="group flex flex-col rounded-[36px] bg-gradient-to-br from-[var(--card)] to-[var(--muted)] p-6 shadow-[var(--shadow-soft)] transition hover:-translate-y-2 hover:shadow-2xl dark:shadow-[0_25px_90px_rgba(0,0,0,0.55)]">
      <div
        className="relative h-64 cursor-pointer overflow-hidden rounded-[28px]"
        onClick={() => onView?.(id)}
      >
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
        <button
          className="absolute right-4 top-4 rounded-full bg-background/70 p-2 text-foreground backdrop-blur hover:text-primary"
          aria-label="Add to wishlist"
          onClick={(event) => {
            event.stopPropagation();
            onWishlist?.(id);
          }}
        >
          <Heart className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-muted-foreground">{category}</p>
          <h3 className="text-xl font-semibold text-foreground">{name}</h3>
        </div>

        <div className="flex items-baseline gap-3">
          <p className="text-2xl font-bold text-foreground">₹{price}</p>
          <p className="text-sm text-muted-foreground line-through">₹{originalPrice}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            className="rounded-full bg-primary/10 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary"
            onClick={(event) => {
              event.stopPropagation();
              onView?.(id);
            }}
          >
            View
          </button>
          <button
            className={cn(
              "flex items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-semibold uppercase tracking-[0.2em] text-background",
              "transition hover:bg-foreground/90",
            )}
            onClick={(event) => {
              event.stopPropagation();
              onAdd?.(id);
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </article>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
