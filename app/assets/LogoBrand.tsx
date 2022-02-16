import Logo, { LogoProps } from "./Logo"
import Brand, { BrandProps } from "./Brand"

type LogoBrandProps = {
  logoProps: LogoProps
  brandProps: BrandProps
}

export default function LogoBrand({ logoProps, brandProps }: LogoBrandProps) {
  return (
    <div className="flex items-center text-indigo-600">
      <span className="w-1/4 h-2 mr-2 lg:mr-4">
        <Logo strokeWidth={2} {...logoProps} />
      </span>
      <span className="w-3/4 h-2">
        <Brand {...brandProps} />
      </span>
    </div>
  )
}
