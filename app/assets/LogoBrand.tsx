import Logo, { LogoProps } from "./Logo"
import Brand, { BrandProps } from "./Brand"

type LogoBrandProps = {
  logoProps: LogoProps
  brandProps: BrandProps
}

export default function LogoBrand({ logoProps, brandProps }: LogoBrandProps) {
  return (
    <div className="flex items-center text-indigo-600 w-full h-full">
      <span className="w-1/4 h-full mr-2 lg:mr-4">
        <Logo strokeWidth={2} {...logoProps} />
      </span>
      <span className="w-3/4 h-full">
        <Brand {...brandProps} />
      </span>
    </div>
  )
}
