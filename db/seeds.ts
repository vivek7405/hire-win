import db, { User } from "./index"
import { SecurePassword } from "blitz"
import seedData from "./seedData.json"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import { Job } from "app/jobs/validations"

/*
 * This seed function is executed when you run `blitz db seed`.
 *
 * Probably you want to use a library like https://chancejs.com
 * or https://github.com/Marak/Faker.js to easily generate
 * realistic data.
 */
let userArray: User[] = []
async function createUsers() {
  for (let user of seedData.users) {
    try {
      const hashedPassword = await SecurePassword.hash(user.password.trim())

      const slug = slugify(`${user.companyName}`, { strict: true })
      const newSlug: string = await findFreeSlug(
        slug,
        async (e) => await db.user.findFirst({ where: { slug: e } })
      )

      const createdUser = await db.user.create({
        data: {
          email: user.email,
          companyName: user.companyName,
          slug: newSlug,
          hashedPassword,
          role: "USER",
        },
      })
      userArray = [...userArray, createdUser]
    } catch (err) {
      console.log(err)
    }
  }
}

async function createJobs() {
  for (let job of seedData.jobs) {
    const {
      title,
      description,
      categoryId,
      workflowId,
      formId,
      country,
      state,
      city,
      remote,
      currency,
      minSalary,
      maxSalary,
      salaryType,
      employmentType,
      validThrough,
      slug,
    } = Job.parse(job)

    try {
      const createdJob = await db.job.create({
        data: {
          title,
          slug: slug!,
          description,
          categoryId: categoryId || null,
          workflowId: workflowId || null,
          formId: formId || null,
          country,
          state,
          city,
          remote,
          currency,
          minSalary,
          maxSalary,
          salaryType,
          employmentType,
          validThrough,
          memberships: {
            create: {
              role: "OWNER",
              user: {
                connect: {
                  id: job.owner,
                },
              },
            },
          },
        },
      })

      for (let user of userArray.filter((u) => u.id !== job.owner)) {
        if (job.members.includes(user.id)) {
          await db.membership.create({
            data: {
              role: "USER",
              job: {
                connect: {
                  id: createdJob.id,
                },
              },
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }
}

const seed = async () => {
  await db.$reset()
  await createUsers().then(async () => {
    await createJobs()
  })
}

export default seed
