import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="group block overflow-hidden rounded-lg bg-card shadow-soft h-full">
      <div className="relative aspect-square lg:aspect-[4/3] w-full overflow-hidden bg-secondary">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="p-2 sm:p-3 lg:p-2">
        <Skeleton className="h-3 w-16 lg:w-14 mb-1.5" />
        <Skeleton className="h-4 w-3/4 lg:h-3.5 lg:w-full mb-1" />
        <div className="mt-1 lg:mt-1.5 flex items-center gap-1.5">
          <Skeleton className="h-4 w-12 lg:h-3 lg:w-10" />
          <Skeleton className="h-3 w-8 lg:h-2.5 lg:w-6" />
        </div>
        <div className="mt-2 lg:mt-1.5 flex gap-1">
          <Skeleton className="h-7 flex-1 lg:h-6" />
          <Skeleton className="h-7 flex-1 lg:h-6" />
        </div>
      </div>
    </div>
  );
}

export default ProductCardSkeleton;

