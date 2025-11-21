import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import shoeOrange from "@/assets/shoe-orange.png";
import shoeBlue from "@/assets/shoe-blue.png";
import shoePurple from "@/assets/shoe-purple.png";
import shoeGreen from "@/assets/shoe-green.png";
import shoeFeatured from "@/assets/shoe-featured.png";
import { ChevronRight } from "lucide-react";

const Shop = () => {
  const products = [
    { id: "1", name: "Popular Shoe Trends", price: "$210.00", image: shoeOrange, bgColor: "bg-gradient-to-br from-[#ffb36b] via-[#ff9855] to-[#ff7a37]" },
    { id: "2", name: "Popular Shoe Trends", price: "$210.00", image: shoePurple, bgColor: "bg-gradient-to-br from-[#ba74ff] via-[#9c63ff] to-[#5f87ff]" },
    { id: "3", name: "Popular Shoe Trends", price: "$210.00", image: shoeGreen, bgColor: "bg-gradient-to-br from-[#7fe0b4] via-[#47cba0] to-[#1ab3ad]" },
    { id: "4", name: "Popular Shoe Trends", price: "$210.00", image: shoeBlue, bgColor: "bg-gradient-to-br from-[#7fe6ff] via-[#46c5ff] to-[#1494ff]" },
    { id: "5", name: "Popular Shoe Trends", price: "$210.00", image: shoeOrange, bgColor: "bg-gradient-to-br from-[#ffb36b] via-[#ff9855] to-[#ff7a37]" },
    { id: "6", name: "Popular Shoe Trends", price: "$210.00", image: shoePurple, bgColor: "bg-gradient-to-br from-[#ba74ff] via-[#9c63ff] to-[#5f87ff]" },
  ];

  const colors = [
    { id: "orange", label: "Orange", swatch: "bg-[#ff9448]" },
    { id: "blue", label: "Blue", swatch: "bg-[#54b6ff]" },
    { id: "yellow", label: "Yellow", swatch: "bg-[#ffd75c]" },
    { id: "gray", label: "Gray", swatch: "bg-[#c1c1c1]" },
  ];

  const sizes = ["39", "40", "41", "42"];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff6e8,_#ffd6a4_60%,_#ffb272)] text-[#1f1d18]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-0">
        <section className="rounded-[48px] bg-[#fff5e3] px-6 py-6 text-[#f8f6f0] shadow-[0_35px_70px_rgba(255,158,61,0.25)] sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-2xl font-black uppercase tracking-[0.8rem] text-[#f03d7f]">D4U</div>
            <div className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#2a2d42] px-6 py-3 text-sm font-semibold uppercase tracking-[0.25rem] text-white">
              <span className="text-[#ffdf7e]">3D</span> Animation |
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-full bg-[#ff1874] px-6 py-3 text-sm font-bold uppercase tracking-[0.2rem] text-white shadow-[0_12px_35px_rgba(255,24,116,0.45)]">
                Contribute
              </button>
              <div className="space-y-1">
                <span className="block h-0.5 w-7 rounded-full bg-[#1f1d18]" />
                <span className="block h-0.5 w-7 rounded-full bg-[#1f1d18]" />
                <span className="block h-0.5 w-7 rounded-full bg-[#1f1d18]" />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[48px] bg-[#fff5e3] px-6 py-8 shadow-[0_45px_95px_rgba(255,158,61,0.2)] sm:px-10 sm:py-10">
          <div className="flex flex-wrap items-center gap-6 text-sm font-semibold uppercase tracking-[0.4em] text-[#c18a3f]">
            <span>shophub</span>
            <div className="flex flex-1 flex-wrap items-center justify-center gap-6 text-base tracking-[0.2em] text-[#9c8766]">
              <span className="text-[#1f1d18]">Home</span>
              <span className="text-[#1f1d18]">Shop</span>
              <span>Blog</span>
              <span>Contact</span>
            </div>
            <span className="text-[#1f1d18]">$239.00</span>
          </div>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.6em] text-[#c18a3f]">/ product</p>
              <h1 className="text-4xl font-black text-[#1f1d18] sm:text-6xl">Shop</h1>
            </div>
            <div className="text-right text-sm text-[#9c8766]">
              <p>Showing 1-12 of 48 results</p>
              <p className="font-semibold text-[#1f1d18]">Default sorting</p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.6em] text-[#c18a3f] sm:flex-row">
            <span>Make an original design</span>
            <span>We believe in your potential</span>
          </div>
        </section>

        <section className="rounded-[48px] bg-[#fff5e3] px-6 py-8 shadow-[0_45px_95px_rgba(255,158,61,0.2)] sm:px-10 sm:py-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.6em] text-[#c18a3f]">Shop / Product details</p>
              <h2 className="text-3xl font-black text-[#1f1d18] sm:text-5xl">Product Details</h2>
            </div>
            <button className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#1f1d18]">
              Next Product <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-12 grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 space-y-6 text-[#1f1d18] lg:order-1">
              <div>
                <h3 className="text-4xl font-black">Nike Air Max 270</h3>
                <p className="text-xl font-semibold text-[#c18a3f]">to Chuck Taylors</p>
                <p className="mt-4 text-base leading-relaxed text-[#8c7b5d]">
                  Nike's Air Force 1s have been running the streets since the early 80s, making this one of the most iconic sneakers this year.
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#c18a3f]">Color</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <div key={color.id} className="flex flex-col items-center gap-2">
                      <span className={`h-11 w-11 rounded-full border-4 border-[#fff5e3] ${color.swatch}`} />
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9c8766]">{color.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#c18a3f]">Size</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {sizes.map((size) => (
                    <span
                      key={size}
                      className={`rounded-full px-6 py-2 text-sm font-bold uppercase tracking-[0.3em] ${
                        size === "40" ? "bg-[#1f1d18] text-[#fff5e3]" : "bg-[#ffe7c6] text-[#1f1d18]"
                      }`}
                    >
                      {size}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <p className="text-4xl font-black">$290.00</p>
                <Button className="rounded-full bg-[#1f1d18] px-10 py-6 text-lg font-semibold uppercase tracking-[0.3em] text-[#fff5e3] hover:bg-[#2d2922]">
                  Add to cart
                </Button>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative rounded-[40px] bg-gradient-to-b from-[#ffe29c] via-[#ffc063] to-[#ff994a] p-10 shadow-[0_55px_95px_rgba(255,158,61,0.35)]">
                <div className="absolute inset-x-6 top-10 rounded-full bg-white/40 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.5em] text-[#c18a3f]">
                  Nike Air Max 270
                </div>
                <div className="relative mt-12 flex min-h-[360px] items-center justify-center">
                  <div className="absolute h-64 w-64 rounded-full bg-white/50 blur-3xl" />
                  <img
                    src={shoeFeatured}
                    alt="Nike Air Max 270"
                    className="relative z-10 w-full max-w-[320px] drop-shadow-[0_35px_45px_rgba(0,0,0,0.35)]"
                  />
                  <div className="absolute bottom-8 left-8 rounded-2xl bg-white/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-[#c18a3f]">
                    New Product
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <p className="text-xs uppercase tracking-[0.6em] text-[#c18a3f]">Related Product</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 3).map((product) => (
                <div key={product.id} className="rounded-[32px] bg-[#fff0d2] p-4">
                  <div className={`${product.bgColor} rounded-[26px] p-6`}>
                    <img src={product.image} alt={product.name} className="w-full max-w-[160px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Shop;
