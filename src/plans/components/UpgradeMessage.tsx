type UpgradeMessagePropsType = {
  message: string
}
const UpgradeMessage = ({ message }: UpgradeMessagePropsType) => {
  return (
    <a
      href="https://appsumo.com/products/hirewin"
      target="_blank"
      rel="external"
      className="px-4 py-1 rounded-lg border bg-theme-50 border-theme-600 flex items-center space-x-2 text-theme-800"
    >
      <span className="text-3xl">👉</span>
      <span>
        {message || "Upgrade"}, <span className="font-bold">$29 lifetime access.</span>
      </span>
    </a>
  )
}

export default UpgradeMessage
