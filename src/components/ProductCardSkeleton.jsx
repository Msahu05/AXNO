import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="group block overflow-hidden rounded-lg bg-card shadow-soft">
      <div className="relative aspect-square w-full overflow-hidden bg-secondary">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="p-4">
        <Skeleton className="h-3 w-20 mb-2" />
        <Skeleton className="h-5 w-3/4 mb-2" />
        <div className="mt-2 flex items-center gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>
    </div>
  );
}

export default ProductCardSkeleton;

