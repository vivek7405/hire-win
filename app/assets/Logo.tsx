export type LogoProps = {
  // fill color
  fill?: string
  fillLeftEye?: string
  fillNose?: string
  fillRightEye?: string
  fillLeftEyeGlass?: string

  // stroke color
  stroke?: string
  strokeLeftEye?: string
  strokeNose?: string
  strokeRightEye?: string
  strokeLeftEyeGlass?: string

  // stroke width
  strokeWidth?: number
  strokeWidthLeftEye?: number
  strokeWidthNose?: number
  strokeWidthRightEye?: number
  strokeWidthLeftEyeGlass?: number
}

export default function Logo({
  fill,
  fillLeftEye,
  fillLeftEyeGlass,
  fillRightEye,
  fillNose,
  stroke,
  strokeLeftEye,
  strokeLeftEyeGlass,
  strokeRightEye,
  strokeNose,
  strokeWidth,
  strokeWidthLeftEye,
  strokeWidthLeftEyeGlass,
  strokeWidthRightEye,
  strokeWidthNose,
}: LogoProps) {
  const defaultFill = "black"
  let strk = fill || defaultFill
  const defaultStroke = strk === "none" ? "black" : strk
  const defaultStrokeWidth = 1
  const strokeLinecap = "butt"

  return (
    <div className="flex justify-center items-center w-full h-full">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        // viewBox="81.327 114.126 312.688 259.686"  // No Padding
        // viewBox="61.327 94.126 352.688 299.686"   // More Padding
        viewBox="71.327 104.126 332.688 279.686" // Little Padding
        width="100%"
        height="100%"
      >
        <g
          transform="matrix(1, 0, 0, 1, -29.885393, 96.211571)"
          fill={fill || defaultFill}
          stroke={stroke || defaultStroke}
          strokeWidth={strokeWidth || defaultStrokeWidth}
          strokeLinecap={strokeLinecap}
        >
          {/* left-eye */}
          <path
            fill={fillLeftEye || fill || defaultFill}
            stroke={strokeLeftEye || stroke || defaultStroke}
            strokeWidth={strokeWidthLeftEye || strokeWidth || defaultStrokeWidth}
            strokeLinecap={strokeLinecap}
            d="M178.3,117.9c-1.9,0-3.8,0.1-5.7,0.4c-6.8,0.9-13.2,3.4-18.7,7.3c7.2,0.8,14,2.3,20.7,4.3 c-15.7,1.9-27.8,15.3-27.8,31.4c0,17.5,14.2,31.6,31.6,31.6s31.6-14.2,31.6-31.6c0-6-1.7-11.6-4.6-16.4c5.2,3.4,10.2,7.3,15.2,11.7 c-0.2-2.9-0.8-5.8-1.6-8.6c-1.8-6-4.8-11.4-9-16C202,123.1,190.4,117.9,178.3,117.9z M189.9,150.1c-5.4,0-9.8-4.4-9.8-9.8 c0-5.4,4.4-9.8,9.8-9.8s9.8,4.4,9.8,9.8C199.8,145.7,195.4,150.1,189.9,150.1z"
          />

          {/* left-eye-glass */}
          <path
            fill={fillLeftEyeGlass || fill || defaultFill}
            stroke={strokeLeftEyeGlass || stroke || defaultStroke}
            strokeWidth={strokeWidthLeftEyeGlass || strokeWidth || defaultStrokeWidth}
            strokeLinecap={strokeLinecap}
            d="M226.7,79c0.3,1.3,0.7,2.6,1.3,3.7l-3.9,5.2l-8.7,12c-30.2-17.8-69.7-10.2-90.8,18.6 c-12.1,16.5-15.8,36.7-11.9,55.3c1.5,7.3,4.3,14.5,8.1,21c4.6,7.8,10.8,14.7,18.5,20.4c30.7,22.6,74.1,16,96.7-14.7 c12.1-16.5,15.8-36.6,11.9-55.2c-2.7-12.7-9-24.8-18.6-34.5c-0.9-0.9-1.8-1.7-2.7-2.6l2-2.7L239.2,91c5.5,0.9,11.3-1.3,14.8-6 l31.4-42.6c2.7-3.7,3.5-8.1,2.7-12.3c-0.7-3.6-2.7-6.9-5.9-9.2c-6.8-5-16.5-3.6-21.5,3.3l-31.3,42.6C226.6,70.5,225.8,75,226.7,79z M229.6,141.9c0.8,2.2,1.4,4.5,1.9,6.8c3,14.1,0.1,29.4-9,41.8c-4.7,6.4-10.6,11.4-17.1,14.9c-4.3,2.4-8.9,4.1-13.7,5.2 c-1.4,0.3-2.8,0.6-4.2,0.7c-13.1,1.9-26.8-1.2-38.3-9.6c-10.8-7.9-17.6-19.3-20.2-31.4c-1.5-7.2-1.5-14.7,0-22 c1.5-7,4.5-13.8,9-19.9c17.1-23.3,50-28.3,73.3-11.2c0.3,0.2,0.5,0.4,0.8,0.6C220.4,124.3,226.3,132.7,229.6,141.9z"
          />

          {/* right-eye */}
          <path
            fill={fillRightEye || fill || defaultFill}
            stroke={strokeRightEye || stroke || defaultStroke}
            strokeWidth={strokeWidthRightEye || strokeWidth || defaultStrokeWidth}
            strokeLinecap={strokeLinecap}
            d="M423.9,154.2c0-21.8-9.3-41.4-24-55.2c-8-0.4-16.7-0.3-25.9,0.7l0,0c0,0,0,0-0.1,0c-0.9,0.1-1.8,0.2-2.7,0.3 c-59.7,7-98.7,47.4-98.7,47.4c0,4.4,0.3,8.7,0.8,13.2l0,0c0.2,2.8,0.7,5.6,1.2,8.3c0,0.1,0,0.3,0,0.4l0,0 c7,34.4,37.4,60.3,73.9,60.3C390.1,229.5,423.9,195.8,423.9,154.2z M326,123.3c5.4,0,9.8,4.4,9.8,9.8c0,5.4-4.4,9.8-9.8,9.8 s-9.8-4.4-9.8-9.8C316.1,127.7,320.5,123.3,326,123.3z M337.9,207.7c-27.1-2.7-48.2-24.1-51-50.6c7.7-7.4,15.5-13.9,23.5-19.3 c-2.9,4.8-4.6,10.4-4.6,16.4c0,17.5,14.2,31.6,31.6,31.6c17.5,0,31.6-14.2,31.6-31.6c0-16.2-12.1-29.5-27.8-31.4 c15-4.7,31.1-6.2,49.1-4.4c7.7,11.1,11.3,24.5,9.9,38.2C397.2,187.9,369.3,210.8,337.9,207.7z"
          />

          {/* nose */}
          <path
            fill={fillNose || fill || defaultFill}
            stroke={strokeNose || stroke || defaultStroke}
            strokeWidth={strokeWidthNose || strokeWidth || defaultStrokeWidth}
            strokeLinecap={strokeLinecap}
            d="M261.7,195.5c0,0-8.8,20.2-32.7,36.2l32.7,45.9l32.7-45.9C270.5,215.8,261.7,195.5,261.7,195.5z"
          />
        </g>
      </svg>
    </div>
  )
}
