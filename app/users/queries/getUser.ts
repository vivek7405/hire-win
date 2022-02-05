import Guard from "app/guard/ability"
import { Ctx, NotFoundError } from "blitz"
import db, { Prisma } from "db"

interface GetUserInput extends Pick<Prisma.UserFindFirstArgs, "where"> {}

async function getUser({ where }: GetUserInput, ctx: Ctx) {
  const user = await db.user.findFirst({
    where,
    include: {
      memberships: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              companyName: true,
              companyInfo: true,
              website: true,
              logo: true,
            },
          },
          job: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  })

  if (!user) throw new NotFoundError()

  return user
}

export default getUser
