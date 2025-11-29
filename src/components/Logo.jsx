import React from 'react';

const Logo = ({ className = "", showTagline = true, size = "default", inlineTagline = false }) => {
  // Size variants
  const sizes = {
    small: { logo: "text-lg", tagline: "text-[8px]", crown: "w-3 h-3", line: "h-[0.5px]" },
    default: { logo: "text-xl sm:text-2xl lg:text-3xl", tagline: "text-[10px] sm:text-xs", crown: "w-4 h-4 sm:w-5 sm:h-5", line: "h-[1px]" },
    large: { logo: "text-4xl sm:text-5xl lg:text-6xl", tagline: "text-sm sm:text-base", crown: "w-6 h-6 sm:w-8 sm:h-8", line: "h-[1.5px]" }
  };

  const currentSize = sizes[size] || sizes.default;

  // Tagline component
  const TaglineComponent = () => (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Left Line */}
      <div className={`${currentSize.line} w-8 sm:w-12 lg:w-16 bg-current`}></div>
      
      {/* Tagline Text */}
      <span className={`uppercase tracking-[0.2em] sm:tracking-[0.3em] font-medium ${currentSize.tagline}`}>
        OWN THE LOOK
      </span>
      
      {/* Right Line */}
      <div className={`${currentSize.line} w-8 sm:w-12 lg:w-16 bg-current`}></div>
    </div>
  );

  if (inlineTagline) {
    // Horizontal layout: Logo on left, tagline on right
    return (
      <div className={`flex items-center gap-0.5 sm:gap-1.5 lg:gap-2 ${className}`}>
        {/* Logo with Crown */}
        <div className="relative inline-flex items-center justify-center flex-shrink-0">
          <span className={`font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] ${currentSize.logo} relative inline-block`}>
            L
            <span className="relative inline-block">
              {/* Crown Icon - positioned above first "O" */}
              <svg
                className={`absolute ${currentSize.crown} -top-2 sm:-top-3 left-0`}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 16L3 10L8 12L12 3L16 12L21 10L19 16H5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="currentColor"
                />
              </svg>
              O
            </span>
            <span className="tracking-[-0.05em]">O</span>
            KLYN
          </span>
        </div>
        {showTagline && <TaglineComponent/>}
      </div>
    );
  }

  // Vertical layout: Logo on top, tagline below
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Logo with Crown */}
      <div className="relative inline-flex items-center justify-center">
        <span className={`font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] ${currentSize.logo} relative inline-block`}>
          L
          <span className="relative inline-block">
            {/* Crown Icon - positioned above first "O" */}
            <svg
              className={`absolute ${currentSize.crown} -top-2 sm:-top-3 left-0`}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 16L3 10L8 12L12 3L16 12L21 10L19 16H5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="currentColor"
              />
            </svg>
            O
          </span>
          <span className="tracking-[-0.05em]">O</span>
          KLYN
        </span>
      </div>

      {/* Tagline with Lines */}
      {showTagline && (
        <div className="mt-1 sm:mt-2">
          <TaglineComponent />
        </div>
      )}
    </div>
  );
};

export default Logo;
