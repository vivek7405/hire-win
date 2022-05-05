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
    {
      name: "Interviewdetails",
      href: "/admin/interviewdetails",
      current: router.route === "/admin/interviewdetails",
    },
    {
      name: "Categorys",
      href: "/admin/categorys",
      current: router.route === "/admin/categorys",
    },
    {
      name: "Workflows",
      href: "/admin/workflows",
      current: router.route === "/admin/workflows",
    },
    {
      name: "Stages",
      href: "/admin/stages",
      current: router.route === "/admin/stages",
    },
    {
      name: "Workflowstages",
      href: "/admin/workflowstages",
      current: router.route === "/admin/workflowstages",
    },
    {
      name: "Forms",
      href: "/admin/forms",
      current: router.route === "/admin/forms",
    },
    {
      name: "Questions",
      href: "/admin/questions",
      current: router.route === "/admin/questions",
    },
    {
      name: "Scorecards",
      href: "/admin/scorecards",
      current: router.route === "/admin/scorecards",
    },
    {
      name: "Cardquestions",
      href: "/admin/cardquestions",
      current: router.route === "/admin/cardquestions",
    },
    {
      name: "Scorecardquestions",
      href: "/admin/scorecardquestions",
      current: router.route === "/admin/scorecardquestions",
    },
    {
      name: "Scorecardjobworkflowstages",
      href: "/admin/scorecardjobworkflowstages",
      current: router.route === "/admin/scorecardjobworkflowstages",
    },
    {
      name: "Scores",
      href: "/admin/scores",
      current: router.route === "/admin/scores",
    },
    {
      name: "Questionoptions",
      href: "/admin/questionoptions",
      current: router.route === "/admin/questionoptions",
    },
    {
      name: "Formquestions",
      href: "/admin/formquestions",
      current: router.route === "/admin/formquestions",
    },
    {
      name: "Answers",
      href: "/admin/answers",
      current: router.route === "/admin/answers",
    },
    {
      name: "Candidates",
      href: "/admin/candidates",
      current: router.route === "/admin/candidates",
    },
    {
      name: "Defaultcalendars",
      href: "/admin/defaultcalendars",
      current: router.route === "/admin/defaultcalendars",
    },
    {
      name: "Calendars",
      href: "/admin/calendars",
      current: router.route === "/admin/calendars",
    },
    {
      name: "Dailyschedules",
      href: "/admin/dailyschedules",
      current: router.route === "/admin/dailyschedules",
    },
    {
      name: "Schedules",
      href: "/admin/schedules",
      current: router.route === "/admin/schedules",
    },
    {
      name: "Bookings",
      href: "/admin/bookings",
      current: router.route === "/admin/bookings",
    },
  ]
}

export default routes
