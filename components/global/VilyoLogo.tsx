'use client';



const VilyoIncLogo = ({
  className = "",
  width = 200,
  height = 120,
}) => {
  // Define colors from the logo concept
  const colors = {
    titlePrimary: '#2D4D89', // Dark Blue for "Vilyo"
    titleSecondary: '#FF5733', // Orange Red for " Inc."
    tagline: '#6C7A89', // Grayish Blue for the tagline
  };

  return (
    <div className={className} style={{ width: width, height: height }}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 400 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        // Note: In JSX, attributes like 'class' become 'className'
      >
        {/*
          Using JSX's style prop for text for best compatibility.
          All CSS properties are camelCased (e.g., 'font-weight' -> 'fontWeight').
        */}

        {/* Title: Vilyo */}
        <text
          x="50"
          y="60"
          fill={colors.titlePrimary}
          style={{
            fontFamily: 'Arial, sans-serif',
            fontWeight: 700, // Numerical value for bold
            fontSize: 48,
          }}
        >
          Vilyo
        </text>

        {/* Title: Inc. */}
        <text
          x="175" // Adjusted x to place "Inc." right after "Vilyo"
          y="60"
          fill={colors.titleSecondary}
          style={{
            fontFamily: 'Arial, sans-serif',
            fontWeight: 700,
            fontSize: 48,
          }}
        >
          {' Inc.'}
        </text>

        {/* Tagline: Inventory.Finance.eCommerce. */}
        <text
          x="50"
          y="90"
          fill={colors.tagline}
          style={{
            fontFamily: 'Arial, sans-serif',
            fontWeight: 400,
            fontSize: 16,
          }}
        >
          Inventory.Finance.eCommerce.
        </text>
      </svg>
    </div>
  );
};

export default VilyoIncLogo;