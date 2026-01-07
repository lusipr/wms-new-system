import { ButtonBack } from "@/components/button-back";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen w-screen relative flex justify-center items-center">
      <div className="absolute inset-x-0 -top-20 z-0">
        <svg
          className="min-w-7xl -translate-x-60 md:translate-x-0 mx-auto w-full -scale-y-100 contrast-150 opacity-50 dark:opacity-25"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_1739_2)">
            <g filter="url(#filter0_f_1739_2)">
              <ellipse
                cx="987.203"
                cy="967.25"
                rx="581"
                ry="356.5"
                transform="rotate(8.47676 987.203 967.25)"
                fill="#9641C1"
              ></ellipse>
            </g>
            <g filter="url(#filter1_f_1739_2)">
              <ellipse
                cx="991.907"
                cy="1000.77"
                rx="454.5"
                ry="280.5"
                transform="rotate(11.69 991.907 1000.77)"
                fill="#FF94C8"
              ></ellipse>
            </g>
            <g filter="url(#filter2_f_1739_2)">
              <ellipse
                cx="405"
                cy="1050"
                rx="448"
                ry="332"
                fill="#007FEC"
              ></ellipse>
            </g>
            <g filter="url(#filter3_f_1739_2)">
              <ellipse
                cx="779"
                cy="985.5"
                rx="259"
                ry="204.5"
                fill="#FFE8AE"
              ></ellipse>
            </g>
          </g>
          <defs>
            <filter
              id="filter0_f_1739_2"
              x="110.117"
              y="304.308"
              width="1754.18"
              height="1325.88"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              ></feBlend>
              <feGaussianBlur
                stdDeviation="150"
                result="effect1_foregroundBlur_1739_2"
              ></feGaussianBlur>
            </filter>
            <filter
              id="filter1_f_1739_2"
              x="343.172"
              y="510.984"
              width="1297.47"
              height="979.573"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              ></feBlend>
              <feGaussianBlur
                stdDeviation="100"
                result="effect1_foregroundBlur_1739_2"
              ></feGaussianBlur>
            </filter>
            <filter
              id="filter2_f_1739_2"
              x="-343"
              y="418"
              width="1496"
              height="1264"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              ></feBlend>
              <feGaussianBlur
                stdDeviation="150"
                result="effect1_foregroundBlur_1739_2"
              ></feGaussianBlur>
            </filter>
            <filter
              id="filter3_f_1739_2"
              x="320"
              y="581"
              width="918"
              height="809"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              ></feBlend>
              <feGaussianBlur
                stdDeviation="100"
                result="effect1_foregroundBlur_1739_2"
              ></feGaussianBlur>
            </filter>
            <clipPath id="clip0_1739_2">
              <rect width="1440" height="900" fill="white"></rect>
            </clipPath>
          </defs>
        </svg>
      </div>
      <div className="flex flex-col justify-center gap-3 h-full max-w-7xl px-10 w-full z-30 absolute top-0">
        <p className="text-sm text-sky-600 font-medium">404 Error</p>
        <h2 className="text-4xl font-bold">We can&apos;t find that page</h2>
        <p className="text-gray-500">
          Sorry, the page you are looking for doesn&apos;t exist or has been
          moved.
        </p>
        <div className="flex gap-3 mt-5">
          <ButtonBack />
          <Link href="/dashboard">
            <Button className="bg-sky-400/70 hover:bg-sky-400 text-black">
              <Rocket className="w-4 h-4 mr-2" />
              Jump to the Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
