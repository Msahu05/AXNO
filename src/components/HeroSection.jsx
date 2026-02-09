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
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [plugin] = useState(() =>
    Autoplay({ 
      delay: 5000, 
      stopOnInteraction: false,
      stopOnMouseEnter: false,
      stopOnFocusIn: false
    })
  );

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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

  // Reinitialize carousel when images are loaded
  useEffect(() => {
    if (api && slideshowImages.length > 0 && !loading) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (api) {
          api.reInit();
        }
      });
    }
  }, [api, slideshowImages.length, loading]);

  // Handle window resize for large screens
  useEffect(() => {
    if (!api) return;

    let resizeTimeout;
    const handleResize = () => {
      // Debounce resize handler
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (api) {
          api.reInit();
        }
      }, 200);
    };

    window.addEventListener('resize', handleResize);
    
    // Reinit on mount for large screens to ensure proper initialization
    const isLargeScreen = window.innerWidth >= 1024;
    if (isLargeScreen && slideshowImages.length > 0 && !loading) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (api) {
            api.reInit();
          }
        }, 300);
      });
    }

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [api, slideshowImages.length, loading]);

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
    <section className="relative w-full py-4 sm:py-8 md:py-12 lg:py-16 px-0 sm:px-4 md:px-6 lg:px-8 overflow-hidden bg-transparent">
      <div className="w-full px-2 sm:px-3 md:px-4 mt-4 sm:mt-6">
        {loading ? (
          <div className="flex h-[50vh] min-h-[400px] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : heroImages.length === 0 ? (
          <div className="flex h-[50vh] min-h-[400px] items-center justify-center">
            <p className="text-muted-foreground">No slideshow images available</p>
          </div>
        ) : (
          <div className="relative w-full flex flex-col items-center overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
            <div className="w-full max-w-full sm:max-w-[1600px] mx-auto relative overflow-hidden">
            <Carousel
              plugins={[plugin]}
              opts={{ 
                loop: true,
                align: "center",
                slidesToScroll: 1,
                dragFree: false,
                skipSnaps: false,
                duration: 25,
                watchDrag: true,
              }}
              className="w-full relative overflow-hidden"
              setApi={setApi}
            >
              <CarouselContent className={isSmallScreen ? "-ml-1" : "ml-0 sm:-ml-4 md:-ml-6 lg:-ml-8"}>
                {heroImages.map((image, index) => {
                  const isActive = currentIndex === index;
                  const distance = Math.abs(index - currentIndex);
                  
                  // Calculate scale and opacity based on distance from center
                  const getScale = () => {
                    if (isSmallScreen) {
                      // On small screens, active item full size, next item slightly smaller
                      if (isActive) return 1;
                      if (distance === 1) return 0.85;
                      return 0.7;
                    }
                    if (isActive) return 1;
                    if (distance === 1) return 0.85;
                    if (distance === 2) return 0.7;
                    return 0.6;
                  };
                  
                  const getOpacity = () => {
                    if (isSmallScreen) {
                      // On small screens, both active and next should be clearly visible
                      if (isActive) return 1;
                      if (distance === 1) return 0.9;
                      return 0.4;
                    }
                    if (isActive) return 1;
                    if (distance === 1) return 0.7;
                    if (distance === 2) return 0.5;
                    return 0.4;
                  };
                  
                  const getBrightness = () => {
                    if (isSmallScreen) {
                      if (isActive) return 1;
                      if (distance === 1) return 0.9;
                      return 0.6;
                    }
                    if (isActive) return 1;
                    if (distance === 1) return 0.75;
                    if (distance === 2) return 0.6;
                    return 0.5;
                  };
                  
                  return (
                    <CarouselItem
                      key={index}
                      className={`${isSmallScreen ? 'pl-1 pr-1 basis-[70%]' : 'pl-0 pr-0 sm:pl-4 sm:pr-0 md:pl-6 lg:pl-8 basis-[75%] sm:basis-[35%] md:basis-[60%] lg:basis-[50%] xl:basis-[45%]'} flex-shrink-0`}
                    >
                      <div
                        className={`relative w-full ${isSmallScreen ? 'rounded-lg' : 'rounded-2xl sm:rounded-3xl'} overflow-hidden ${isSmallScreen ? 'bg-gray-800 dark:bg-gray-900 shadow-lg' : 'shadow-lg hover:shadow-xl'} transition-all duration-500 cursor-pointer group`}
                        onClick={image.onClick}
                        style={{
                          transform: `scale(${getScale()})`,
                          opacity: getOpacity(),
                          filter: `brightness(${getBrightness()})`,
                          zIndex: isActive ? 10 : Math.max(1, 5 - distance),
                          transition: 'transform 0.5s ease-out, opacity 0.5s ease-out, filter 0.5s ease-out',
                          height: isSmallScreen ? 'auto' : '400px',
                          minHeight: isSmallScreen ? '200px' : '400px',
                          maxHeight: isSmallScreen ? '240px' : 'none',
                          pointerEvents: isActive ? 'auto' : 'none',
                          willChange: 'transform',
                          maxWidth: '100%',
                          display: 'block',
                        }}
                      >
                        <img
                          src={image.src}
                          alt={image.alt}
                          className={`w-full ${isSmallScreen ? 'h-auto object-contain' : 'h-full object-cover'} object-center transition-transform duration-500 ${isSmallScreen ? '' : 'group-hover:scale-110'}`}
                          style={{
                            width: '100%',
                            height: isSmallScreen ? 'auto' : '100%',
                            maxHeight: isSmallScreen ? '240px' : 'none',
                            objectFit: isSmallScreen ? 'contain' : 'cover',
                            objectPosition: 'center',
                            display: 'block'
                          }}
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=80";
                          }}
                        />
                        {!isSmallScreen && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            {isActive && (
                              <div className="absolute inset-0 border-2 border-white/30 rounded-2xl sm:rounded-3xl pointer-events-none" />
                            )}
                          </>
                        )}
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (api && typeof api.scrollPrev === 'function') {
                    try {
                      api.scrollPrev();
                    } catch (error) {
                      console.error('Error scrolling previous:', error);
                    }
                  }
                }}
                className={`absolute ${isSmallScreen ? 'left-1 h-8 w-8 bg-gray-200 hover:bg-gray-300' : 'left-2 sm:left-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 bg-white hover:bg-white'} border border-gray-300 shadow-lg text-gray-900 z-50 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer`}
                style={isSmallScreen ? { top: '50%', transform: 'translateY(-50%)' } : {}}
                aria-label="Previous slide"
              >
                <ArrowLeft className={isSmallScreen ? "h-4 w-4" : "h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8"} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (api && typeof api.scrollNext === 'function') {
                    try {
                      api.scrollNext();
                    } catch (error) {
                      console.error('Error scrolling next:', error);
                    }
                  }
                }}
                className={`absolute ${isSmallScreen ? 'right-1 h-8 w-8 bg-gray-200 hover:bg-gray-300' : 'right-2 sm:right-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 bg-white hover:bg-white'} border border-gray-300 shadow-lg text-gray-900 z-50 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer`}
                style={isSmallScreen ? { top: '50%', transform: 'translateY(-50%)' } : {}}
                aria-label="Next slide"
              >
                <ArrowRight className={isSmallScreen ? "h-4 w-4" : "h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8"} />
              </button>
            </Carousel>
            </div>
            
            {/* Pagination Dots - Below slideshow */}
            {heroImages.length > 1 && (
              <div className={`relative w-full flex justify-center items-center z-50 ${isSmallScreen ? 'gap-2 mt-4' : 'gap-2 sm:gap-3 mt-4 sm:mt-6 md:mt-8'}`}>
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (api && typeof api.scrollTo === 'function') {
                        try {
                          api.scrollTo(index);
                        } catch (error) {
                          console.error('Error scrolling to slide:', error);
                        }
                      }
                    }}
                    className={`rounded-full transition-all duration-300 cursor-pointer ${
                      currentIndex === index
                        ? isSmallScreen 
                          ? 'bg-gray-500 h-2.5 w-8 border border-gray-400' 
                          : 'bg-gray-900 dark:bg-white h-2.5 w-8 sm:h-3 sm:w-10 md:h-3.5 md:w-12 lg:h-4 lg:w-14'
                        : isSmallScreen
                          ? 'bg-gray-400 h-2.5 w-2.5 border border-gray-300'
                          : 'bg-gray-400 dark:bg-white/60 hover:bg-gray-500 dark:hover:bg-white/80 h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                    style={isSmallScreen ? { 
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                      zIndex: 50
                    } : { 
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
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

