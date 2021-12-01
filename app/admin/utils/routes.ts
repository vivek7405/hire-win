const routes = (router) => {
  return [
    {
      name: "Dashboard",
      href: "/admin",
      current: router.route === `/admin`,
    },
    {
      name: "Users",
      href: `/admin/users`,
      current: router.route === `/admin/users`,
    },
    {
      name: "Sessions",
      href: `/admin/sessions`,
      current: router.route === `/admin/sessions`,
    },
    {
      name: "Tokens",
      href: `/admin/tokens`,
      current: router.route === `/admin/tokens`,
    },
    {
      name: "Jobs",
      href: `/admin/jobs`,
      current: router.route === `/admin/jobs`,
    },
    {
      name: "Memberships",
      href: `/admin/memberships`,
      current: router.route === `/admin/memberships`,
    },
  ]
}

export default routes
