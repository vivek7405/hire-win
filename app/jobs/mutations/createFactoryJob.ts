import { Ctx } from "blitz"
import createJob from "./createJob"
import db, { EmploymentType, RemoteOption, SalaryType } from "db"

async function createFactoryJob(companyId: string, ctx: Ctx) {
  ctx.session.$authorize()

  const category = await db.category.findFirst({
    where: { name: "Software Development", companyId },
  })

  const job = await createJob(
    {
      title: "Software Engineer",
      description: `<p>We are looking for a <span style="background-color: rgb(255, 255, 0);">passionate Software Engineer</span> to design, develop and install software solutions.</p><p><br></p><p>Software Engineer responsibilities include gathering user requirements, defining system functionality and writing code in various languages, like Java, Ruby on Rails or .NET programming languages (e.g. C++ or JScript.NET.) Our ideal candidates are familiar with the software development life cycle (SDLC) from preliminary system analysis to tests and deployment.&nbsp;</p><p><br></p><p>Ultimately, the role of the Software Engineer is to build high-quality, innovative and fully performing software that complies with coding standards and technical design.&nbsp;</p><p><br></p><p><strong>Responsibilities</strong></p><ul><li>Execute full software development life cycle (SDLC)</li><li>Develop flowcharts, layouts and documentation to identify requirements and solutions</li><li>Write well-designed, testable code</li><li>Produce specifications and determine operational feasibility</li><li>Integrate software components into a fully functional software system</li><li>Develop software verification plans and quality assurance procedures</li><li>Document and maintain software functionality</li><li>Troubleshoot, debug and upgrade existing systems</li><li>Deploy programs and evaluate user feedback</li><li>Comply with project plans and industry standards</li><li>Ensure software is updated with latest features</li></ul><p><br></p><p><strong>Requirements and skills</strong></p><ul><li>Proven work experience as a Software Engineer or Software Developer</li><li>Experience designing interactive applications</li><li>Ability to develop software in <span style="background-color: rgb(255, 255, 0);">Java, Ruby on Rails, C++</span> or other programming languages</li><li>Excellent knowledge of relational databases, SQL and ORM technologies (JPA2, Hibernate)</li><li>Experience developing web applications using at least one popular web framework (JSF, Wicket, GWT, Spring MVC)</li><li>Experience with test-driven development</li><li>Proficiency in software engineering tools</li><li>Ability to document requirements and specifications</li><li>BSc degree in Computer Science, Engineering or relevant field</li></ul>`,
      categoryId: category?.id,
      country: "US",
      state: "AL",
      city: "Montgomery",
      remoteOption: RemoteOption.Fully_Remote,
      postToGoogle: false,
      currency: "USD",
      minSalary: 60000,
      maxSalary: 80000,
      salaryType: SalaryType.YEAR,
      showSalary: true,
      employmentType: [EmploymentType.FULL_TIME],
    },
    ctx
  )

  return job
}

export default createFactoryJob
