import { ArrowRight, Truck, CreditCard, Headphones } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useState, useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
import { productsAPI, getImageUrl } from "@/lib/api";

export function HeroSection() {
  const navigate = useNavigate();
  const [heroProducts, setHeroProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plugin] = useState(() =>
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  useEffect(() => {
    const loadHeroProducts = async () => {
      try {
        const response = await productsAPI.getAll({ limit: 4 });
        setHeroProducts(response.products || []);
      } catch (error) {
        console.error('Error loading hero products:', error);
        setHeroProducts([]);
      } finally {
        setLoading(false);
      }
    };
    loadHeroProducts();
  }, []);

  // Use product images or fallback to placeholder
  const heroImages = heroProducts.length > 0 
    ? heroProducts.map(product => ({
        src: getImageUrl(Array.isArray(product.gallery) ? product.gallery[0] : product.gallery || product.image),
        alt: product.name || "Fashion model"
      }))
    : [
        { src: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80", alt: "Fashion model" },
        { src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80", alt: "Stylish woman" },
        { src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80", alt: "Model showcasing fashion" },
        { src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80", alt: "Elegant fashion" }
      ];

  return (
    <section className="relative min-h-[60vh] sm:min-h-[80vh] overflow-hidden bg-background">
      <div className="container relative mx-auto flex min-h-[60vh] sm:min-h-[80vh] items-center px-4 lg:px-8 py-6 sm:py-12">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16 w-full">
          {/* Hero Image Carousel - First on mobile */}
          <div className="relative flex items-center justify-center order-1 lg:order-2 py-4 sm:py-8" style={{ animationDelay: "0.2s" }}>
            <div className="relative w-full max-w-full sm:max-w-[80%] lg:max-w-[33%] overflow-hidden rounded-2xl bg-secondary shadow-elevated animate-scale-in">
              <div className="relative w-full" style={{ paddingBottom: 'calc(100% + 4px)' }}>
                <div className="absolute inset-0 h-full w-full">
                  {loading ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  ) : (
                    <Carousel
                      plugins={[plugin]}
                      opts={{ loop: true }}
                      className="h-full w-full"
                    >
                      <CarouselContent className="h-full -ml-0">
                        {heroImages.map((image, index) => (
                          <CarouselItem key={index} className="h-full pl-0">
                            <img
                              src={image.src}
                              alt={image.alt}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80";
                              }}
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content - Second on mobile */}
          <div className="flex flex-col justify-center space-y-4 sm:space-y-6 animate-fade-in py-4 sm:py-8 order-2 lg:order-1">
            {/* Top Banner */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm font-medium text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" />
              New Collection Available
            </div>

            {/* Headline */}
            <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              <span className="text-foreground">Step into Style:</span>
              <br />
              <span className="text-primary">Your Ultimate Fashion</span>
              <br />
              <span className="text-primary">Destination</span>
            </h1>

            {/* Description */}
            <p className="max-w-md text-sm sm:text-base text-muted-foreground leading-relaxed">
              Discover curated collections that blend timeless elegance with contemporary trends. Elevate your wardrobe today.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Button 
                size="lg" 
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft hover:shadow-elevated rounded-lg px-4 sm:px-6 py-3 sm:py-6 text-sm sm:text-base"
                onClick={() => navigate('/category/hoodies')}
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-primary text-foreground hover:bg-accent rounded-lg px-4 sm:px-6 py-3 sm:py-6 text-sm sm:text-base"
                onClick={() => document.getElementById('custom')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-4 sm:gap-6 pt-4 sm:pt-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-foreground">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On orders above ₹999</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-foreground">Flexible Payment</p>
                  <p className="text-xs text-muted-foreground">Multiple secure options</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary/10">
                  <Headphones className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-foreground">24/7 Support</p>
                  <p className="text-xs text-muted-foreground">Always here to help</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

