// import React, { ReactNode } from "react"
// import { useRouter, Link } from "blitz"
// import routes from "app/admin/utils/routes"
// import { CreditCardIcon, CogIcon, UserGroupIcon, KeyIcon } from "@heroicons/react/outline"

// type LayoutProps = {
//   children: ReactNode
// }

// const AdminLayout = ({ children }: LayoutProps) => {
//   const router = useRouter()

//   const subNavigation = routes(router)

//   return (
//     <div className="flex flex-col lg:flex-row mt-6 lg:space-x-4">
//       <div className="w-full mb-6 lg:mb-0 lg:w-1/5">
//         {subNavigation.map((item) => (
//           <Link href={item.href} passHref key={item.name}>
//             <a
//               data-testid={`${item.name}-jobSettingsLink`}
//               className={`${
//                 item.current
//                   ? "bg-gray-50 text-theme-600 hover:bg-white"
//                   : "text-gray-900 hover:text-gray-900 hover:bg-gray-50"
//               } group px-3 py-2 flex items-center text-sm font-medium`}
//             >
//               <span className="truncate">{item.name}</span>
//             </a>
//           </Link>
//         ))}
//       </div>
//       <div className="space-y-6 w-full lg:w-4/5">{children}</div>
//     </div>
//   )
// }

// export default AdminLayout

export default function AdminLayout() {}
