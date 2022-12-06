import Guard from "src/guard/ability"
import { Ctx, NotFoundError } from "blitz"
import db, { Prisma } from "db"

interface GetUserInput extends Pick<Prisma.UserFindFirstArgs, "where"> {}

async function getUser({ where }: GetUserInput, ctx: Ctx) {
  const user = await db.user.findFirst({
    where,
    include: {
      jobs: {
        include: {
          user: {
            include: {
              companies: {
                include: {
                  company: true,
                },
              },
            },
          },
          job: {
            include: {
              category: true,
            },
          },
        },
      },
      calendars: true,
    },
  })

  if (!user) throw new NotFoundError()

  return user
}

export default getUser
