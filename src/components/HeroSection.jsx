import { ArrowRight, ArrowLeft, Truck, Headphones, Shirt } from "lucide-react";
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
    Autoplay({ delay: 5000, stopOnInteraction: false })
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
    <section className="relative w-full py-8 sm:py-12 md:py-16 lg:py-20 overflow-visible bg-transparent">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {loading ? (
          <div className="flex h-[50vh] min-h-[400px] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : heroImages.length === 0 ? (
          <div className="flex h-[50vh] min-h-[400px] items-center justify-center">
            <p className="text-muted-foreground">No slideshow images available</p>
          </div>
        ) : (
          <div className="relative w-full min-h-[400px] sm:min-h-[500px] md:min-h-[600px] overflow-visible" style={{ position: 'relative', zIndex: 1 }}>
            <Carousel
              plugins={[plugin]}
              opts={{ 
                loop: true,
                align: "center",
                slidesToScroll: 1,
                dragFree: false,
                skipSnaps: false,
                duration: 25,
              }}
              className="w-full relative overflow-visible"
              setApi={setApi}
            >
              <CarouselContent className="-ml-2 sm:-ml-4 md:-ml-6 lg:-ml-8 overflow-visible">
                {heroImages.map((image, index) => {
                  const isActive = currentIndex === index;
                  const distance = Math.abs(index - currentIndex);
                  
                  // Calculate scale and opacity based on distance from center
                  const getScale = () => {
                    if (isActive) return 1;
                    if (distance === 1) return 0.85;
                    if (distance === 2) return 0.7;
                    return 0.6;
                  };
                  
                  const getOpacity = () => {
                    if (isActive) return 1;
                    if (distance === 1) return 0.7;
                    if (distance === 2) return 0.5;
                    return 0.4;
                  };
                  
                  const getBrightness = () => {
                    if (isActive) return 1;
                    if (distance === 1) return 0.75;
                    if (distance === 2) return 0.6;
                    return 0.5;
                  };
                  
                  return (
                    <CarouselItem
                      key={index}
                      className={`pl-2 sm:pl-4 md:pl-6 lg:pl-8 basis-[35%] sm:basis-[35%] md:basis-[60%] lg:basis-[50%] xl:basis-[45%]`}
                    >
                      <div
                        className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer group"
                        onClick={image.onClick}
                        style={{
                          transform: `scale(${getScale()})`,
                          opacity: getOpacity(),
                          filter: `brightness(${getBrightness()})`,
                          zIndex: isActive ? 10 : Math.max(1, 5 - distance),
                          transition: 'transform 0.5s ease-out, opacity 0.5s ease-out, filter 0.5s ease-out',
                          height: '400px',
                          minHeight: '400px',
                          pointerEvents: 'auto',
                        }}
                      >
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {isActive && (
                          <div className="absolute inset-0 border-2 border-white/30 rounded-2xl sm:rounded-3xl pointer-events-none" />
                        )}
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <button
                onClick={() => {
                  if (api) {
                    api.scrollPrev();
                  }
                }}
                className="!left-0 !-translate-y-1/2 h-10 w-10 sm:h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 bg-white/90 hover:bg-white border-2 border-gray-300 shadow-lg text-gray-900 !z-[100] absolute top-1/2 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ 
                  position: 'absolute',
                  pointerEvents: 'auto',
                  left: '0',
                }}
                aria-label="Previous slide"
              >
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8" />
              </button>
              <button
                onClick={() => {
                  if (api) {
                    api.scrollNext();
                  }
                }}
                className="!right-0 !-translate-y-1/2 h-10 w-10 sm:h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 bg-white/90 hover:bg-white border-2 border-gray-300 shadow-lg text-gray-900 !z-[100] absolute top-1/2 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ 
                  position: 'absolute',
                  pointerEvents: 'auto',
                  right: '0',
                }}
                aria-label="Next slide"
              >
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8" />
              </button>
            </Carousel>
            
            {/* Pagination Dots */}
            {heroImages.length > 1 && (
              <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-20 items-center pointer-events-auto mt-4 sm:mt-6">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={`rounded-full transition-all duration-300 ${
                      currentIndex === index
                        ? 'bg-white h-2.5 w-8 sm:h-3 sm:w-10 md:h-3.5 md:w-12 lg:h-4 lg:w-14'
                        : 'bg-white/60 hover:bg-white/80 h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                    style={{ 
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

