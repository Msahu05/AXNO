import { ArrowRight, Truck, Headphones, Shirt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { useState, useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
import { slideshowAPI, getImageUrl } from "@/lib/api";

export function HeroSection() {
  const navigate = useNavigate();
  const [slideshowImages, setSlideshowImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState(null);
  const [plugin] = useState(() =>
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  useEffect(() => {
    const loadSlideshow = async () => {
      try {
        const response = await slideshowAPI.getSlideshow();
        setSlideshowImages(response.slideshow || []);
      } catch (error) {
        console.error('Error loading slideshow:', error);
        setSlideshowImages([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadSlideshow();
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Use only slideshow images for carousel
  const heroImages = (() => {
    const images = [];
    
    // Add slideshow images (sorted by order)
    const sortedSlideshow = [...slideshowImages].sort((a, b) => (a.order || 0) - (b.order || 0));
    sortedSlideshow.forEach((slide, index) => {
      images.push({
        src: slide.image?.startsWith('data:') ? slide.image : getImageUrl(slide.image) || "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80",
        alt: `Slide ${index + 1}`,
        isBanner: false,
        redirectUrl: slide.redirectUrl || (index === 0 ? '/category/hoodies' : index === 1 ? '/category/t-shirts' : index === 2 ? '/category/sweatshirts' : '/category/all'),
        onClick: () => {
          navigate(slide.redirectUrl || (index === 0 ? '/category/hoodies' : index === 1 ? '/category/t-shirts' : index === 2 ? '/category/sweatshirts' : '/category/all'));
        }
      });
    });
    
    // If no images at all, add fallback
    if (images.length === 0) {
      images.push(
        { src: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80", alt: "Fashion model", onClick: () => navigate('/category/all') }
      );
    }
    
    return images;
  })();

  return (
    <section className="relative min-h-[60vh] sm:min-h-[80vh] overflow-hidden bg-transparent w-full pt-28 sm:pt-[5.75rem] lg:pt-28">
      
      <div className="w-full relative flex min-h-[60vh] sm:min-h-[80vh] items-center px-0 sm:px-4 lg:px-6 py-0 sm:py-16">
        <div className="grid gap-2 sm:gap-4 lg:grid-cols-2 lg:gap-6 w-full">
          {/* Content - Left side on medium+ screens, hidden on small screens */}
          <div className="order-2 lg:order-1 hidden md:flex flex-col items-start justify-center space-y-2 sm:space-y-3 animate-fade-in py-2 sm:py-3">
            {/* Top Banner */}
            <div className="inline-flex w-fit items-center gap-1 rounded-lg bg-secondary px-3 py-1 text-lg sm:text-xl md:text-2xl xl:text-3xl font-bold text-secondary-foreground">
              Looklyn - Own The Look
            </div>

            {/* Headline */}
            <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              <span className="text-foreground">Made For You,</span>
              <br />
              <span className="text-foreground">Designed By You!!</span>
            </h1>

            {/* Description */}
            <p className="max-w-md text-sm sm:text-base text-muted-foreground leading-relaxed">
              Built by a young mind, driven by bold ideas.
              <br />
              Made for people who don't follow trends — they create them.
              <br />
              Your design. Your vibe. Your look.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Button 
                size="lg" 
                className="gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-soft hover:shadow-elevated rounded-lg px-4 sm:px-6 py-3 sm:py-6 text-sm sm:text-base"
                onClick={() => navigate('/category/hoodies')}
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-secondary bg-transparent hover:bg-accent hover:text-accent-foreground text-foreground rounded-lg px-4 sm:px-6 py-3 sm:py-6 text-sm sm:text-base"
                onClick={() => document.getElementById('custom')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-4 sm:gap-6 pt-4 sm:pt-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-secondary">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-foreground">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">All Over India</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-secondary">
                  <Headphones className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-foreground">24/7 WhatsApp Support</p>
                  <p className="text-xs text-muted-foreground">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-secondary">
                  <Shirt className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-foreground">Printed After Order</p>
                  <p className="text-xs text-muted-foreground">Made just for you</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image Carousel - Right side on large screens */}
          <div className="relative flex items-center justify-center order-1 lg:order-2 py-0 sm:py-10 w-full" style={{ animationDelay: "0.2s" }}>
            <div className="relative w-full overflow-hidden rounded-none sm:rounded-2xl bg-secondary shadow-elevated animate-scale-in">
              <div className="relative w-full" style={{ paddingBottom: 'calc(100% + 0px)' }}>
                <div className="absolute inset-0 h-full w-full">
                  {loading ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  ) : (
                    <>
                      <Carousel
                        plugins={[plugin]}
                        opts={{ loop: true }}
                        className="h-full w-full relative"
                        setApi={setApi}
                      >
                        <CarouselContent className="h-full -ml-0">
                          {heroImages.map((image, index) => (
                            <CarouselItem key={index} className="h-full pl-0">
                              <div 
                                className="h-full w-full cursor-pointer relative group"
                                onClick={image.onClick}
                              >
                                <img
                                  src={image.src}
                                  alt={image.alt}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80";
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2 sm:left-4 h-10 w-10 bg-[#9ca3af] hover:bg-[#9ca3af]/80 border-2 border-primary/20 shadow-lg" />
                        <CarouselNext className="right-2 sm:right-4 h-10 w-10 bg-[#9ca3af] hover:bg-[#9ca3af]/80 border-2 border-primary/20 shadow-lg" />
                      </Carousel>
                      
                      {/* Pagination Dots - Outside carousel for better visibility */}
                      {heroImages.length > 1 && (
                        <div className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 flex gap-3 sm:gap-4 z-[100] items-center pointer-events-auto px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-black/70 backdrop-blur-md">
                          {heroImages.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => api?.scrollTo(index)}
                              className={`rounded-full transition-all duration-300 border-2 ${
                                currentIndex === index
                                  ? 'bg-white border-white h-4 w-12 sm:h-5 sm:w-16 md:h-5 md:w-20'
                                  : 'bg-white/80 hover:bg-white border-white/50 h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5'
                              }`}
                              aria-label={`Go to slide ${index + 1}`}
                              style={{ 
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.9)',
                                minWidth: currentIndex === index ? '3rem' : '1rem'
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

