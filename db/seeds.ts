import db, { User } from "./index"
import { SecurePassword } from "blitz"
import seedData from "./seedData.json"

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
      const createdUser = await db.user.create({
        data: { email: user.email, hashedPassword, role: "USER" },
      })
      userArray = [...userArray, createdUser]
    } catch (err) {
      console.log(err)
    }
  }
}

async function createJobs() {
  for (let job of seedData.jobs) {
    try {
      const createdJob = await db.job.create({
        data: {
          name: job.name,
          slug: job.slug,
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
