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
      name: "Workspaces",
      href: `/admin/workspaces`,
      current: router.route === `/admin/workspaces`,
    },
    {
      name: "Memberships",
      href: `/admin/memberships`,
      current: router.route === `/admin/memberships`,
    },
    {
      name: "Companyusers",
      href: "/admin/companyusers",
      current: router.route === "/admin/companyusers",
    },
    {
      name: "Companys",
      href: "/admin/companys",
      current: router.route === "/admin/companys",
    },
    {
      name: "Jobs",
      href: "/admin/jobs",
      current: router.route === "/admin/jobs",
    },
    {
      name: "Interviewdetails",
      href: "/admin/interviewdetails",
      current: router.route === "/admin/interviewdetails",
    },
    {
      name: "Jobuserschedulecalendars",
      href: "/admin/jobuserschedulecalendars",
      current: router.route === "/admin/jobuserschedulecalendars",
    },
    {
      name: "Jobusers",
      href: "/admin/jobusers",
      current: router.route === "/admin/jobusers",
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
      name: "Candidateworkflowstageinterviewers",
      href: "/admin/candidateworkflowstageinterviewers",
      current: router.route === "/admin/candidateworkflowstageinterviewers",
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
      name: "Interviews",
      href: "/admin/interviews",
      current: router.route === "/admin/interviews",
    },
    {
      name: "Comments",
      href: "/admin/comments",
      current: router.route === "/admin/comments",
    },
    {
      name: "Emailtemplates",
      href: "/admin/emailtemplates",
      current: router.route === "/admin/emailtemplates",
    },
    {
      name: "Emails",
      href: "/admin/emails",
      current: router.route === "/admin/emails",
    },
    {
      name: "Candidatepools",
      href: "/admin/candidatepools",
      current: router.route === "/admin/candidatepools",
    },
  ]
}

export default routes
