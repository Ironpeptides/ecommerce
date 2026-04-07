import * as React from "react";

const TitleBorder = (props: any) => (
  <svg
    width={114}
    height={35}
    viewBox="0 0 114 35"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="opacity-80"
    {...props}
  >
    {/* Main curved underline */}
    <path
      d="M8 15 Q 57 28, 106 15"
      stroke="#FE296A"
      strokeWidth={4}
      strokeLinecap="round"
    />

    {/* Left flourish / hook */}
    <path
      d="M8 15 Q 2 18, 4 24"
      stroke="#FE296A"
      strokeWidth={4}
      strokeLinecap="round"
    />

    {/* Right flourish / hook */}
    <path
      d="M106 15 Q 112 18, 110 24"
      stroke="#FE296A"
      strokeWidth={4}
      strokeLinecap="round"
    />
  </svg>
);

export default TitleBorder;