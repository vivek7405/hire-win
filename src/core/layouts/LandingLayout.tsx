import Head from "next/head"
import Link from "next/link"
import { useQuery } from "@blitzjs/rpc"
import { Routes } from "@blitzjs/next"
import { ReactNode, Suspense, useEffect, useRef } from "react"
import Navbar from "src/core/components/Navbar"
import getCompanyUser from "src/companies/queries/getCompanyUser"
import LogoBrand from "src/assets/LogoBrand"
import moment from "moment"
import { ExternalLinkIcon } from "@heroicons/react/outline"
import Script from "next/script"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/router"

type LayoutProps = {
  title?: string
  children: ReactNode
}

const LandingLayout = ({ title, children }: LayoutProps) => {
  // var navMenuDiv = document.getElementById("nav-content")
  // var navMenu = document.getElementById("nav-toggle")
  let navMenuDiv = useRef(null as any)
  let navMenu = useRef(null as any)

  // document.onclick = check
  function check(e) {
    var target = (e && e.target) || (event && event.srcElement)

    //Nav Menu
    if (!checkParent(target, navMenuDiv?.current)) {
      // click NOT on the menu
      if (checkParent(target, navMenu?.current)) {
        // click on the link
        if (navMenuDiv?.current?.classList.contains("hidden")) {
          navMenuDiv?.current?.classList.remove("hidden")
        } else {
          navMenuDiv?.current?.classList.add("hidden")
        }
      } else {
        // click both outside link and outside menu, hide menu
        navMenuDiv?.current?.classList.add("hidden")
      }
    }
  }
  function checkParent(t, elm) {
    while (t.parentNode) {
      if (t == elm) {
        return true
      }
      t = t.parentNode
    }
    return false
  }

  const { t } = useTranslation()

  const router = useRouter()
  return (
    <>
      <Script
        strategy="lazyOnload"
        src="https://embed.tawk.to/6364c8c8b0d6371309cd3d09/1gh0r0k2g"
      />
      <Head>
        <title>{title || "Hire.win | Simple Yet Powerful Hiring Solution"}</title>
        <link rel="icon" href="/favicon.ico" />

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />

        <meta property="og:image" content="/logo-whitebg.png" key="ogimage" />
        <meta
          property="og:title"
          content={title || "Hire.win | Simple Yet Powerful Hiring Solution"}
          key="ogtitle"
        />
        <meta
          name="description"
          content="The simpler, more affordable hiring solution for your next job opening"
        ></meta>
        <meta
          property="og:description"
          content="The simpler, more affordable hiring solution for your next job opening"
          key="ogdesc"
        />
      </Head>
      <div className="bg-gradient-to-r from-fuchsia-100 via-purple-200 to-indigo-200 leading-relaxed tracking-wide">
        {/* Uncomment once you want the lifetime banner to appear */}
        {/* <div className="w-full h-fit px-5 py-5 md:py-3 bg-theme-900 text-white flex flex-col md:flex-row items-center justify-center space-y-5 md:space-y-0 md:space-x-5">
          <span className="text-5xl">🎉</span>
          <span className="text-xl text-center">
            <b>Lifetime 50% off</b> on the Recruiter Plan. Apply Coupon <b>CHRISTMAS50</b>
          </span>
          <Link href={Routes.UserSettingsBillingPage()} legacyBehavior passHref>
            <a className="rounded-full bg-white text-black px-4 py-1 text-lg font-bold">
              Click Here
            </a>
          </Link>
        </div> */}
        {/* <div className="max-w-8xl mx-auto"> */}
        <div className="flex flex-col min-h-screen">
          <nav id="header" className="w-full z-30 top-0 py-1 px-4">
            <div className="w-full flex flex-wrap items-center justify-between mt-0 py-2">
              <div className="w-44 h-10 lg:h-16 lg:w-80 flex">
                <Link href={Routes.Home()} legacyBehavior>
                  <a className="w-full h-full flex items-center justify-center">
                    {/* <LogoBrand logoProps={{ fill: "#4f46e5" }} brandProps={{ fill: "#4f46e5" }} /> */}
                    <div className="w-2/5 h-full">
                      <svg viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
                        <g
                          strokeLinecap="round"
                          fill="#4f46e5"
                          // transform="matrix(1, 0, 0, 1, -29.885393, 96.211571)"
                        >
                          <path d="M178.3,117.9c-1.9,0-3.8,0.1-5.7,0.4c-6.8,0.9-13.2,3.4-18.7,7.3c7.2,0.8,14,2.3,20.7,4.3 c-15.7,1.9-27.8,15.3-27.8,31.4c0,17.5,14.2,31.6,31.6,31.6s31.6-14.2,31.6-31.6c0-6-1.7-11.6-4.6-16.4c5.2,3.4,10.2,7.3,15.2,11.7 c-0.2-2.9-0.8-5.8-1.6-8.6c-1.8-6-4.8-11.4-9-16C202,123.1,190.4,117.9,178.3,117.9z M189.9,150.1c-5.4,0-9.8-4.4-9.8-9.8 c0-5.4,4.4-9.8,9.8-9.8s9.8,4.4,9.8,9.8C199.8,145.7,195.4,150.1,189.9,150.1z" />

                          <path d="M261.7,195.5c0,0-8.8,20.2-32.7,36.2l32.7,45.9l32.7-45.9C270.5,215.8,261.7,195.5,261.7,195.5z" />

                          <path d="M423.9,154.2c0-21.8-9.3-41.4-24-55.2c-8-0.4-16.7-0.3-25.9,0.7l0,0c0,0,0,0-0.1,0c-0.9,0.1-1.8,0.2-2.7,0.3 c-59.7,7-98.7,47.4-98.7,47.4c0,4.4,0.3,8.7,0.8,13.2l0,0c0.2,2.8,0.7,5.6,1.2,8.3c0,0.1,0,0.3,0,0.4l0,0 c7,34.4,37.4,60.3,73.9,60.3C390.1,229.5,423.9,195.8,423.9,154.2z M326,123.3c5.4,0,9.8,4.4,9.8,9.8c0,5.4-4.4,9.8-9.8,9.8 s-9.8-4.4-9.8-9.8C316.1,127.7,320.5,123.3,326,123.3z M337.9,207.7c-27.1-2.7-48.2-24.1-51-50.6c7.7-7.4,15.5-13.9,23.5-19.3 c-2.9,4.8-4.6,10.4-4.6,16.4c0,17.5,14.2,31.6,31.6,31.6c17.5,0,31.6-14.2,31.6-31.6c0-16.2-12.1-29.5-27.8-31.4 c15-4.7,31.1-6.2,49.1-4.4c7.7,11.1,11.3,24.5,9.9,38.2C397.2,187.9,369.3,210.8,337.9,207.7z" />

                          <path d="M226.7,79c0.3,1.3,0.7,2.6,1.3,3.7l-3.9,5.2l-8.7,12c-30.2-17.8-69.7-10.2-90.8,18.6 c-12.1,16.5-15.8,36.7-11.9,55.3c1.5,7.3,4.3,14.5,8.1,21c4.6,7.8,10.8,14.7,18.5,20.4c30.7,22.6,74.1,16,96.7-14.7 c12.1-16.5,15.8-36.6,11.9-55.2c-2.7-12.7-9-24.8-18.6-34.5c-0.9-0.9-1.8-1.7-2.7-2.6l2-2.7L239.2,91c5.5,0.9,11.3-1.3,14.8-6 l31.4-42.6c2.7-3.7,3.5-8.1,2.7-12.3c-0.7-3.6-2.7-6.9-5.9-9.2c-6.8-5-16.5-3.6-21.5,3.3l-31.3,42.6C226.6,70.5,225.8,75,226.7,79z M229.6,141.9c0.8,2.2,1.4,4.5,1.9,6.8c3,14.1,0.1,29.4-9,41.8c-4.7,6.4-10.6,11.4-17.1,14.9c-4.3,2.4-8.9,4.1-13.7,5.2 c-1.4,0.3-2.8,0.6-4.2,0.7c-13.1,1.9-26.8-1.2-38.3-9.6c-10.8-7.9-17.6-19.3-20.2-31.4c-1.5-7.2-1.5-14.7,0-22 c1.5-7,4.5-13.8,9-19.9c17.1-23.3,50-28.3,73.3-11.2c0.3,0.2,0.5,0.4,0.8,0.6C220.4,124.3,226.3,132.7,229.6,141.9z" />
                        </g>
                      </svg>
                    </div>
                    <div className="w-3/5 h-full">
                      <svg viewBox="0 -100 1450 600" xmlns="http://www.w3.org/2000/svg">
                        <g strokeLinecap="round" fillRule="evenodd" fill="#4f46e5">
                          <path d="M0.4,318.006,L0.8,286.006,Q0.8,224.406,13.4,157.606,A494.846,494.846,0,0,1,25.618,106.863,Q33.4,80.988,43.561,59.356,A272.22,272.22,0,0,1,50.6,45.406,Q63.939,20.789,80.159,9.52,A50.623,50.623,0,0,1,109.6,0.006,A34.349,34.349,0,0,1,136.055,11.675,A46.47,46.47,0,0,1,139.4,15.806,Q150.8,31.606,150.8,56.806,A154.371,154.371,0,0,1,142.912,104.521,A213.19,213.19,0,0,1,127.2,140.606,A337.115,337.115,0,0,1,107.477,172.169,Q96.395,188.056,82.126,205.516,A850.225,850.225,0,0,1,50.4,242.006,Q49.2,262.806,49.2,284.806,Q62.4,250.806,78.6,229.406,Q94.8,208.006,110.6,198.806,Q122.35,191.965,132.662,190.211,A41.349,41.349,0,0,1,139.6,189.606,A37.429,37.429,0,0,1,149.889,190.895,Q161.427,194.2,164.492,205.978,A38.306,38.306,0,0,1,165.6,215.606,A94.391,94.391,0,0,1,165.084,224.641,Q163.469,241.087,156.8,272.006,A837.026,837.026,0,0,0,153.839,286.102,Q150.032,305.101,149.349,314.402,A49.837,49.837,0,0,0,149.2,318.006,A32.507,32.507,0,0,0,149.66,323.746,Q151.459,333.718,160.284,333.998,A16.266,16.266,0,0,0,160.8,334.006,A16.782,16.782,0,0,0,166.655,332.848,Q171.64,330.988,177.541,326.142,A74.253,74.253,0,0,0,179.8,324.206,A149.492,149.492,0,0,0,186.573,317.729,Q190.099,314.162,194.162,309.71,A466.423,466.423,0,0,0,198.516,304.859,A186.299,186.299,0,0,1,198.944,297.226,Q199.462,290.169,200.477,282.014,A464.684,464.684,0,0,1,203,264.606,Q207.6,236.406,214.8,212.006,A62.804,62.804,0,0,1,217.015,205.439,Q220.088,197.856,224.4,194.406,A18.064,18.064,0,0,1,229.642,191.576,Q235.144,189.606,243.6,189.606,A45.269,45.269,0,0,1,250.791,190.125,Q263.394,192.164,263.972,202.22,A17.17,17.17,0,0,1,264,203.206,A55.325,55.325,0,0,1,263.649,208.722,Q262.39,220.803,256.615,248.575,A1331.801,1331.801,0,0,1,256.4,249.606,A972.361,972.361,0,0,0,252.659,267.497,Q247.83,291.829,246.981,304.386,A72.134,72.134,0,0,0,246.8,309.206,A72.702,72.702,0,0,0,247.082,315.838,Q247.697,322.531,249.654,326.877,A19.902,19.902,0,0,0,250,327.606,A11.723,11.723,0,0,0,253.171,331.63,Q255.443,333.431,258.653,333.867,A15.946,15.946,0,0,0,260.8,334.006,A13.861,13.861,0,0,0,265.652,333.03,Q269.958,331.413,275.228,327.12,A74.913,74.913,0,0,0,278.8,324.006,A170.508,170.508,0,0,0,285.445,317.464,Q288.901,313.889,292.881,309.472,A514.794,514.794,0,0,0,298.045,303.639,A327.777,327.777,0,0,1,310.578,219.35,A307.771,307.771,0,0,1,312.8,212.006,Q316.4,200.406,324.6,195.006,Q332.8,189.606,347.6,189.606,Q355.6,189.606,358.8,191.606,A6.164,6.164,0,0,1,361.285,194.717,Q362,196.559,362,199.206,A28.15,28.15,0,0,1,361.713,202.771,Q360.688,210.505,356,228.006,Q353.25,239.006,351.256,248.116,A446.955,446.955,0,0,0,349.6,256.006,Q347.2,268.006,345.6,285.606,Q356.093,258.261,368.608,239.004,A157.138,157.138,0,0,1,375.2,229.606,A171.835,171.835,0,0,1,386.404,216.221,Q392.299,209.91,398.114,205.242,A75.921,75.921,0,0,1,407.4,198.806,Q419.15,191.965,429.462,190.211,A41.349,41.349,0,0,1,436.4,189.606,A37.429,37.429,0,0,1,446.689,190.895,Q458.227,194.2,461.292,205.978,A38.306,38.306,0,0,1,462.4,215.606,A30.328,30.328,0,0,1,462.273,218.077,Q461.768,224.044,459.248,238.297,A833.379,833.379,0,0,1,458.8,240.806,Q456.27,253.455,455.74,258.604,A22.516,22.516,0,0,0,455.6,260.806,A29.037,29.037,0,0,0,455.981,265.741,Q457.513,274.577,465.196,274.8,A13.858,13.858,0,0,0,465.6,274.806,A19.582,19.582,0,0,0,472.814,273.255,A39.825,39.825,0,0,0,474.864,272.34,A115.747,115.747,0,0,1,484.8,241.406,A97.567,97.567,0,0,1,506.089,212.289,A92.094,92.094,0,0,1,517,203.606,Q537.6,189.606,563.6,189.606,Q586.8,189.606,600.8,203.406,A45.839,45.839,0,0,1,613.566,227.657,A66.722,66.722,0,0,1,614.8,240.806,A64.568,64.568,0,0,1,595.614,287.586,A79.785,79.785,0,0,1,595,288.206,Q575.2,308.006,528,319.606,A33.016,33.016,0,0,0,548.537,335.732,Q556.156,338.006,566,338.006,Q579.658,338.006,596.195,330.752,A137.573,137.573,0,0,0,607,325.406,Q630,312.806,646.8,292.406,A19.056,19.056,0,0,1,650.16,289.276,A12.548,12.548,0,0,1,657.6,286.806,A8.9,8.9,0,0,1,664.598,289.975,A12.659,12.659,0,0,1,665.8,291.606,A17.503,17.503,0,0,1,667.77,296.198,Q668.8,299.884,668.8,304.806,A54.131,54.131,0,0,1,667.982,314.531,Q666.306,323.694,661.2,329.606,A115.983,115.983,0,0,1,644.964,345.605,Q636.707,352.361,626.456,358.658,A214.527,214.527,0,0,1,619.4,362.806,Q592.4,378.006,561.6,378.006,A124.373,124.373,0,0,1,535.503,375.433,Q518.841,371.857,506.278,363.31,A71.211,71.211,0,0,1,496.4,355.206,A75.468,75.468,0,0,1,475.523,316.184,A111.587,111.587,0,0,1,475.307,315.118,A65.321,65.321,0,0,1,450.4,320.006,A66.62,66.62,0,0,1,438.146,318.952,Q431.18,317.646,425.74,314.726,A32.905,32.905,0,0,1,418.2,309.206,A35.928,35.928,0,0,1,408.073,289.771,A52.121,52.121,0,0,1,407.2,280.006,Q407.2,274.006,408.4,268.006,A364.758,364.758,0,0,0,408.731,264.542,Q409.118,260.263,409.186,258.054,A27.832,27.832,0,0,0,409.2,257.206,A13.78,13.78,0,0,0,409.032,254.95,Q408.364,250.947,405.038,250.811,A5.809,5.809,0,0,0,404.8,250.806,A7.846,7.846,0,0,0,401.18,251.837,Q396.082,254.523,389,264.206,Q379.2,277.606,369.6,299.606,Q360,321.606,354,346.006,Q350.615,360.469,346.402,367.711,A23.468,23.468,0,0,1,343.8,371.406,A17.865,17.865,0,0,1,336.064,376.458,Q333.139,377.474,329.546,377.823,A40.806,40.806,0,0,1,325.6,378.006,A22.016,22.016,0,0,1,315.304,375.673,Q310.475,373.166,307.163,367.961,A33.827,33.827,0,0,1,304.2,362.006,A67.235,67.235,0,0,1,301.297,351.951,A133.604,133.604,0,0,1,282.736,366.529,Q264.751,378.006,248,378.006,A57.622,57.622,0,0,1,233.137,376.209,A37.88,37.88,0,0,1,210.2,359.606,A68.458,68.458,0,0,1,204.784,349.055,A238.182,238.182,0,0,1,203.768,349.986,A184.423,184.423,0,0,1,185.8,364.406,Q166.4,378.006,141.6,378.006,A56.118,56.118,0,0,1,129.557,376.796,Q117.869,374.227,110.8,366.206,A38.032,38.032,0,0,1,103.249,352.552,Q101.402,346.832,100.752,339.891,A84.688,84.688,0,0,1,100.4,332.006,A75.381,75.381,0,0,1,100.728,325.549,Q101.657,314.964,105.21,296.132,A751.156,751.156,0,0,1,106,292.006,Q110.911,268.205,111.184,258.32,A40.458,40.458,0,0,0,111.2,257.206,A13.78,13.78,0,0,0,111.032,254.95,Q110.364,250.947,107.038,250.811,A5.809,5.809,0,0,0,106.8,250.806,Q102.277,250.806,94.426,260.943,A109.105,109.105,0,0,0,92,264.206,Q84.838,274.204,77.675,288.989,A294.897,294.897,0,0,0,72.8,299.606,Q63.2,321.606,57.2,346.006,Q50.309,375.022,25.001,377.728,A50.8,50.8,0,0,1,19.6,378.006,A25.634,25.634,0,0,1,13.813,377.402,Q10.231,376.57,7.739,374.596,A13.39,13.39,0,0,1,3.8,369.406,Q0,360.806,0,338.406,Q0,328.606,0.234,321.854,A216.428,216.428,0,0,1,0.4,318.006Z M101.2,39.606,Q94,39.606,85.2,60.206,Q76.4,80.806,68.2,115.806,A682.151,682.151,0,0,0,59.32,160.765,A846.5,846.5,0,0,0,54.8,192.006,Q79.6,162.806,95.8,128.406,Q112,94.006,112,66.006,Q112,53.206,109.2,46.406,A17.16,17.16,0,0,0,107.677,43.471,Q105.12,39.606,101.2,39.606Z M521.6,287.606,L521.6,288.406,Q540.069,284.024,552.414,276.212,A63.156,63.156,0,0,0,558.8,271.606,A43.363,43.363,0,0,0,566.543,263.481,A30.001,30.001,0,0,0,572.4,245.606,A22.316,22.316,0,0,0,571.812,240.341,A15.509,15.509,0,0,0,568.2,233.406,A13.847,13.847,0,0,0,559.806,229.026,A19.774,19.774,0,0,0,556.8,228.806,A24.326,24.326,0,0,0,540.097,235.525,Q535.625,239.556,531.8,246.006,Q521.6,263.206,521.6,287.606Z" />

                          <path d="M226,155.406,A25.194,25.194,0,0,0,233.069,159.982,Q240.399,163.206,251.2,163.206,A51.736,51.736,0,0,0,262.338,162.07,A35.407,35.407,0,0,0,278.8,153.806,A30.22,30.22,0,0,0,287.676,139.689,A39.686,39.686,0,0,0,289.2,128.406,A34.167,34.167,0,0,0,288.975,124.428,A23.431,23.431,0,0,0,280,108.006,Q270.8,100.806,256,100.806,Q239.6,100.806,228.6,110.206,A37.708,37.708,0,0,0,226.948,111.703,A29.252,29.252,0,0,0,217.6,133.606,A38.279,38.279,0,0,0,218.42,141.751,A25.525,25.525,0,0,0,226,155.406Z" />

                          <path d="M720,378.006,Q702.4,378.006,693.4,368.406,A32.654,32.654,0,0,1,685.117,351.534,A46.319,46.319,0,0,1,684.4,343.206,A51.466,51.466,0,0,1,685.819,330.779,A36.03,36.03,0,0,1,694.6,314.406,A33.352,33.352,0,0,1,711.763,304.825,A50.597,50.597,0,0,1,723.2,303.606,Q735.12,303.606,743.095,307.551,A26.873,26.873,0,0,1,749.8,312.206,Q757.749,319.802,758.677,333.793,A57.601,57.601,0,0,1,758.8,337.606,A52.724,52.724,0,0,1,757.368,350.243,A36.702,36.702,0,0,1,748.4,367.006,A34.366,34.366,0,0,1,729.151,377.207,A50.052,50.052,0,0,1,720,378.006Z" />

                          <path d="M905.2,324.806,L903.2,295.606,Q892.98,323.3,884.526,340.124,A178.593,178.593,0,0,1,881,346.806,Q871.2,364.406,861.4,371.206,A38.138,38.138,0,0,1,842.837,377.805,A48.087,48.087,0,0,1,838.4,378.006,Q822,378.006,812.6,365.206,A45.969,45.969,0,0,1,807.019,354.797,Q802.853,344.216,801.151,328.424,A176.618,176.618,0,0,1,800.8,324.806,Q797.125,281.931,796.264,247.263,A824.484,824.484,0,0,1,796,226.806,L796,212.806,A41.435,41.435,0,0,1,796.664,206.358,Q797.312,202.943,798.568,200.288,A15.694,15.694,0,0,1,803.2,194.406,Q810,189.206,823.6,189.206,A37.363,37.363,0,0,1,829.23,189.601,Q832.128,190.044,834.443,190.984,A14.965,14.965,0,0,1,839,193.806,A13.432,13.432,0,0,1,842.329,198.791,Q844,202.962,844,209.206,Q844,254.704,849.478,327.204,A3101.247,3101.247,0,0,0,849.6,328.806,Q876.8,271.606,899.6,209.606,A59.541,59.541,0,0,1,902.217,203.473,Q905.744,196.425,910.2,193.406,A24.11,24.11,0,0,1,919.892,189.627,A32.285,32.285,0,0,1,925.2,189.206,A41.622,41.622,0,0,1,930.33,189.499,Q935.829,190.184,938.917,192.477,A10.052,10.052,0,0,1,940.2,193.606,A12.114,12.114,0,0,1,942.591,197.435,Q944.4,201.856,944.4,209.206,Q944.4,255.206,950,328.806,Q969.781,299.464,981.41,279.904,A429.545,429.545,0,0,0,986,272.006,A51.996,51.996,0,0,1,981.148,257.564,A71.749,71.749,0,0,1,980,244.406,Q980,230.806,986,218.006,A57.522,57.522,0,0,1,996.189,202.824,A52.573,52.573,0,0,1,1002.4,197.206,Q1012.8,189.206,1026,189.206,Q1037.6,189.206,1044.8,197.406,Q1052,205.606,1052,221.206,A82.077,82.077,0,0,1,1050.291,237.319,Q1048.755,244.981,1045.837,253.39,A165.556,165.556,0,0,1,1042.4,262.406,A161.547,161.547,0,0,0,1052.877,261.477,Q1063.703,260.191,1078.021,257.371,A544.477,544.477,0,0,0,1080.726,256.83,A460.563,460.563,0,0,1,1086.166,230.841,A386.891,386.891,0,0,1,1091.2,212.006,A62.804,62.804,0,0,1,1093.415,205.439,Q1096.488,197.856,1100.8,194.406,A18.064,18.064,0,0,1,1106.042,191.576,Q1111.544,189.606,1120,189.606,A45.269,45.269,0,0,1,1127.191,190.125,Q1139.794,192.164,1140.372,202.22,A17.17,17.17,0,0,1,1140.4,203.206,A55.325,55.325,0,0,1,1140.049,208.722,Q1138.79,220.803,1133.015,248.575,A1331.801,1331.801,0,0,1,1132.8,249.606,A972.361,972.361,0,0,0,1129.059,267.497,Q1124.23,291.829,1123.381,304.386,A72.134,72.134,0,0,0,1123.2,309.206,A72.702,72.702,0,0,0,1123.482,315.838,Q1124.097,322.531,1126.054,326.877,A19.902,19.902,0,0,0,1126.4,327.606,A11.723,11.723,0,0,0,1129.571,331.63,Q1131.843,333.431,1135.053,333.867,A15.946,15.946,0,0,0,1137.2,334.006,A13.861,13.861,0,0,0,1142.052,333.03,Q1146.358,331.413,1151.628,327.12,A74.913,74.913,0,0,0,1155.2,324.006,A170.508,170.508,0,0,0,1161.845,317.464,Q1165.301,313.889,1169.281,309.472,A514.794,514.794,0,0,0,1174.445,303.639,A327.777,327.777,0,0,1,1186.978,219.35,A307.771,307.771,0,0,1,1189.2,212.006,Q1192.8,200.406,1201,195.006,Q1209.2,189.606,1224,189.606,Q1232,189.606,1235.2,191.606,A6.164,6.164,0,0,1,1237.685,194.717,Q1238.4,196.559,1238.4,199.206,A28.15,28.15,0,0,1,1238.113,202.771,Q1237.088,210.505,1232.4,228.006,Q1229.65,239.006,1227.656,248.116,A446.955,446.955,0,0,0,1226,256.006,Q1223.6,268.006,1222,285.606,Q1232.493,258.261,1245.008,239.004,A157.138,157.138,0,0,1,1251.6,229.606,A171.835,171.835,0,0,1,1262.804,216.221,Q1268.699,209.91,1274.514,205.242,A75.921,75.921,0,0,1,1283.8,198.806,Q1295.55,191.965,1305.862,190.211,A41.349,41.349,0,0,1,1312.8,189.606,A37.429,37.429,0,0,1,1323.089,190.895,Q1334.627,194.2,1337.692,205.978,A38.306,38.306,0,0,1,1338.8,215.606,A94.391,94.391,0,0,1,1338.284,224.641,Q1336.669,241.087,1330,272.006,A837.026,837.026,0,0,0,1327.039,286.102,Q1323.232,305.101,1322.549,314.402,A49.837,49.837,0,0,0,1322.4,318.006,A32.507,32.507,0,0,0,1322.86,323.746,Q1324.659,333.718,1333.484,333.998,A16.266,16.266,0,0,0,1334,334.006,A16.782,16.782,0,0,0,1339.855,332.848,Q1344.84,330.988,1350.741,326.142,A74.253,74.253,0,0,0,1353,324.206,A149.492,149.492,0,0,0,1359.773,317.729,Q1369.175,308.219,1382.4,292.406,A19.056,19.056,0,0,1,1385.76,289.276,A12.548,12.548,0,0,1,1393.2,286.806,A8.9,8.9,0,0,1,1400.198,289.975,A12.659,12.659,0,0,1,1401.4,291.606,A17.503,17.503,0,0,1,1403.37,296.198,Q1404.4,299.884,1404.4,304.806,A54.131,54.131,0,0,1,1403.582,314.531,Q1401.906,323.694,1396.8,329.606,Q1379.6,350.806,1359.8,364.406,Q1340,378.006,1314.8,378.006,A56.118,56.118,0,0,1,1302.757,376.796,Q1291.069,374.227,1284,366.206,A38.032,38.032,0,0,1,1276.449,352.552,Q1274.602,346.832,1273.952,339.891,A84.688,84.688,0,0,1,1273.6,332.006,A75.381,75.381,0,0,1,1273.928,325.549,Q1274.857,314.964,1278.41,296.132,A751.156,751.156,0,0,1,1279.2,292.006,Q1284.111,268.205,1284.384,258.32,A40.458,40.458,0,0,0,1284.4,257.206,A13.78,13.78,0,0,0,1284.232,254.95,Q1283.564,250.947,1280.238,250.811,A5.809,5.809,0,0,0,1280,250.806,Q1275.477,250.806,1267.777,260.943,A106.797,106.797,0,0,0,1265.4,264.206,A148.087,148.087,0,0,0,1258.294,275.466,Q1254.75,281.635,1251.151,288.989,A325.19,325.19,0,0,0,1246.2,299.606,Q1236.4,321.606,1230.4,346.006,Q1227.015,360.469,1222.802,367.711,A23.468,23.468,0,0,1,1220.2,371.406,A17.865,17.865,0,0,1,1212.464,376.458,Q1209.539,377.474,1205.946,377.823,A40.806,40.806,0,0,1,1202,378.006,A22.016,22.016,0,0,1,1191.704,375.673,Q1186.875,373.166,1183.563,367.961,A33.827,33.827,0,0,1,1180.6,362.006,A67.235,67.235,0,0,1,1177.697,351.951,A133.604,133.604,0,0,1,1159.136,366.529,Q1141.151,378.006,1124.4,378.006,A57.622,57.622,0,0,1,1109.537,376.209,A37.88,37.88,0,0,1,1086.6,359.606,A68.458,68.458,0,0,1,1078.229,340.094,Q1075.885,331.275,1075.143,320.827,A141.598,141.598,0,0,1,1074.8,310.806,A186.299,186.299,0,0,1,1075.021,302.368,A123.86,123.86,0,0,1,1056.763,304.312,A141.196,141.196,0,0,1,1051.6,304.406,A115.086,115.086,0,0,1,1025.321,301.477,A104.193,104.193,0,0,1,1018.4,299.606,A771.282,771.282,0,0,1,1000.485,327.251,A895.24,895.24,0,0,1,992.8,338.406,Q979.73,357.031,969.729,366.047,A57.055,57.055,0,0,1,965.4,369.606,Q954,378.006,939.6,378.006,A32.641,32.641,0,0,1,929.107,376.405,A26.206,26.206,0,0,1,915.4,365.606,A43.597,43.597,0,0,1,910.905,356.362,Q907.542,347.053,905.96,333.149,A195.161,195.161,0,0,1,905.2,324.806Z" />

                          <path d="M1102.4,155.406,A25.194,25.194,0,0,0,1109.469,159.982,Q1116.799,163.206,1127.6,163.206,A51.736,51.736,0,0,0,1138.738,162.07,A35.407,35.407,0,0,0,1155.2,153.806,A30.22,30.22,0,0,0,1164.076,139.689,A39.686,39.686,0,0,0,1165.6,128.406,A34.167,34.167,0,0,0,1165.375,124.428,A23.431,23.431,0,0,0,1156.4,108.006,Q1147.2,100.806,1132.4,100.806,Q1116,100.806,1105,110.206,A37.708,37.708,0,0,0,1103.348,111.703,A29.252,29.252,0,0,0,1094,133.606,A38.279,38.279,0,0,0,1094.82,141.751,A25.525,25.525,0,0,0,1102.4,155.406Z" />
                        </g>
                      </svg>
                    </div>
                  </a>
                </Link>
                {/* <span className="text-xs">
                  <Link href={Routes.Beta()}>
                    <a className="text-indigo-600 hover:underline font-semibold">BETA</a>
                  </Link>
                </span> */}
              </div>

              <div className="block lg:hidden">
                <button
                  onClick={check}
                  // id="nav-toggle"
                  ref={navMenu}
                  className="flex items-center px-3 py-2 border rounded text-neutral-700 border-neutral-600 hover:text-neutral-900 hover:border-fuchsia-600 appearance-none focus:outline-none"
                >
                  <svg
                    className="fill-current h-3 w-3"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Menu</title>
                    <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                  </svg>
                </button>
              </div>

              <div
                ref={navMenuDiv}
                className="w-full flex-grow lg:flex lg:items-center lg:w-auto hidden mt-2 lg:mt-0 text-black p-4 lg:p-0 z-20"
              >
                <ul className="list-reset lg:flex justify-end flex-1 items-center">
                  {/* Uncomment when you want the menu to appear */}
                  {/* <li className="mr-3">
                    <Link href={Routes.Blog()}>
                      <a className="font-medium cursor-pointer hover:underline py-2 px-4">
                        Articles
                      </a>
                    </Link>
                  </li> */}
                  <li className="mr-3">
                    <Link href={Routes.Pricing()}>
                      <a className="font-medium cursor-pointer hover:underline py-2 px-4">
                        {/* Pricing & Features */}
                        {t("landing.layout.navbar.pricing_features")}
                      </a>
                    </Link>
                  </li>
                  {/* <li className="mr-3">
                    <Link href={Routes.Refer()}>
                      <a className="font-medium cursor-pointer hover:underline py-2 px-4">
                        Refer & Earn
                      </a>
                    </Link>
                  </li> */}
                  <li className="mr-3">
                    <Link href={Routes.Blog()}>
                      <a className="font-medium cursor-pointer hover:underline py-2 px-4">
                        {/* Blog */}
                        {t("landing.layout.navbar.blog")}
                      </a>
                    </Link>
                  </li>
                  <li className="mr-3">
                    <Link href={Routes.OldSignupPage()}>
                      <a className="font-medium cursor-pointer hover:underline py-2 px-4">
                        {/* Sign up free */}
                        {t("landing.layout.navbar.sign_up_free")}
                      </a>
                    </Link>
                  </li>
                </ul>
                <Link prefetch={true} href={Routes.LoginPage()} legacyBehavior>
                  <a>
                    <button
                      id="navAction"
                      className="bg-gradient-to-br from-fuchsia-500 to-indigo-600 mx-auto lg:mx-0 hover:underline text-white font-extrabold text-lg rounded mt-4 lg:mt-0 py-3 px-8 shadow opacity-75"
                    >
                      {/* Login */}
                      {t("landing.layout.navbar.login")}
                    </button>
                  </a>
                </Link>
              </div>
            </div>
          </nav>

          <div className="mb-auto h-full mt-3">{children}</div>

          <section id="call-to-action" className="bg-white py-8 px-4 mt-20">
            <div className="text-neutral-800">
              <h2 className="w-full my-2 text-4xl lg:text-5xl font-black leading-tight text-center text-neutral-800">
                {/* It only takes 1 minute! */}
                {t("landing.layout.one_minute")}
              </h2>

              <div className="w-full text-center pt-1">
                <div className="mt-1">
                  <span className="text-2xl text-neutral-600">
                    {/* Get an Instant Careers Page along with Applicant Tracking! */}
                    {t("landing.layout.get_instant")}
                  </span>
                </div>
                <div className="mt-10 mb-4">
                  {/* Uncomment this and comment the line below it once you want to provide signup */}
                  {/* <Link href={Routes.Home()} legacyBehavior> */}
                  <Link href={Routes.OldSignupPage()} legacyBehavior>
                    <a>
                      <button className="bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 text-white shadow-lg hover:underline rounded py-3 lg:py-4 px-8 w-fit">
                        <span className="font-extrabold text-xl">
                          {/* Sign up for Free! */}
                          {t("landing.layout.sign_up_free")}
                        </span>
                      </button>
                    </a>
                  </Link>
                  {/* <a
                    href="javascript:void(Tawk_API.maximize())"
                    className="bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 text-white shadow-lg hover:underline rounded py-3 lg:py-4 px-8 w-fit font-extrabold text-xl"
                  >
                    Contact Us for Signing Up
                  </a> */}
                  <div className="mt-2">
                    <Link href={Routes.CareersPage({ companySlug: "acme-inc" })}>
                      <a
                        target="_blank"
                        className="text-indigo-600 hover:underline flex items-center justify-center space-x-1"
                      >
                        <span>
                          {/* View Live Careers Page Example */}
                          {t("landing.layout.live_careers_page_example")}
                        </span>
                        <ExternalLinkIcon className="w-5 h-5" />
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="text-neutral-900 px-4">
            <div className="my-8">
              <div className="w-full flex flex-col py-6 items-center justify-center space-y-4">
                <div>
                  <Link href={Routes.Home()} legacyBehavior>
                    <a className="text-orange-600 no-underline hover:no-underline font-bold text-2xl lg:text-4xl">
                      #hireWIN
                    </a>
                  </Link>
                </div>

                {/* <iframe
                  src="https://hirewin.instatus.com/embed-status/light-sm"
                  className="border-0 w-56 h-12 rounded-lg"
                  frameBorder="0"
                  scrolling="no"
                /> */}

                <div className="flex space-x-4 font-bold">
                  <Link prefetch={true} href={Routes.Terms()} legacyBehavior>
                    <a className="hover:underline">
                      {/* TERMS */}
                      {t("landing.layout.footer.terms")}
                    </a>
                  </Link>
                  <Link prefetch={true} href={Routes.Privacy()} legacyBehavior>
                    <a className="hover:underline">
                      {/* PRIVACY */}
                      {t("landing.layout.footer.privacy")}
                    </a>
                  </Link>
                  <Link prefetch={true} href={Routes.Cookies()} legacyBehavior>
                    <a className="hover:underline">
                      {/* COOKIES */}
                      {t("landing.layout.footer.cookies")}
                    </a>
                  </Link>
                </div>

                <div className="italic text-center">
                  {/* Copyright ©2022 hire.win - All rights reserved */}
                  Copyright ©2022 hire.win - {t("landing.layout.footer.all_rights_reserved")}
                </div>

                <div className="italic text-center">
                  {/* Enjoy the rest of your {moment().format("dddd")}! */}
                  {t("landing.layout.footer.enjoy_day")} {moment().format("dddd")}!
                </div>

                {/* <div className="flex-1">
                  <p className="uppercase font-extrabold md:mb-6">Links</p>
                  <ul className="list-reset mb-6">
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <a className="cursor-pointer font-light no-underline hover:underline">FAQ</a>
                    </li>
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <a className="cursor-pointer font-light no-underline hover:underline">Help</a>
                    </li>
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <Link href={Routes.Support()}>
                        <a className="cursor-pointer font-light no-underline hover:underline">
                          Support
                        </a>
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="flex-1">
                  <p className="uppercase font-extrabold md:mb-6">Legal</p>
                  <ul className="list-reset mb-6">
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <Link href={Routes.Terms()}>
                        <a className="cursor-pointer font-light no-underline hover:underline">
                          Terms
                        </a>
                      </Link>
                    </li>
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <Link href={Routes.Privacy()}>
                        <a className="cursor-pointer font-light no-underline hover:underline">
                          Privacy
                        </a>
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="flex-1">
                  <p className="uppercase font-extrabold md:mb-6">Social</p>
                  <ul className="list-reset mb-6">
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <a className="cursor-pointer font-light no-underline hover:underline">
                        Facebook
                      </a>
                    </li>
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <a className="cursor-pointer font-light no-underline hover:underline">
                        Linkedin
                      </a>
                    </li>
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <a className="cursor-pointer font-light no-underline hover:underline">
                        Twitter
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="flex-1">
                  <p className="uppercase font-extrabold md:mb-6">Company</p>
                  <ul className="list-reset mb-6">
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <a className="cursor-pointer font-light no-underline hover:underline">
                        Official Blog
                      </a>
                    </li>
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <a className="cursor-pointer font-light no-underline hover:underline">
                        About Us
                      </a>
                    </li>
                    <li className="mt-2 inline-block mr-2 md:block md:mr-0">
                      <a className="cursor-pointer font-light no-underline hover:underline">
                        Contact
                      </a>
                    </li>
                  </ul>
                </div> */}
              </div>
            </div>
          </footer>
        </div>
        {/* </div> */}
      </div>
    </>
  )
}

export default LandingLayout
