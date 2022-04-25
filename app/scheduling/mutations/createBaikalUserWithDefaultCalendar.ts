import { Ctx, AuthenticationError, resolver } from "blitz"
// import baikalDB from "cal/baikal/db"
import { PrismaClient } from ".prisma2/client"
const baikalDB = new PrismaClient()

async function createBaikalUserWithDefaultCalendar(
  username: string,
  encryptedPassword: string,
  email: string
) {
  const baikalUser = await baikalDB.user.create({
    data: {
      username: Buffer.from(username),
      digesta1: Buffer.from(encryptedPassword),
    },
  })

  const baikalPrincipal = await baikalDB.principal.create({
    data: {
      uri: Buffer.from(`principals/${username}`),
      email: Buffer.from(email),
      displayname: username,
    },
  })

  const baikalAddressBook = await baikalDB.addressbook.create({
    data: {
      principaluri: Buffer.from(`principals/${username}`),
      displayname: "Default Address Book",
      uri: Buffer.from("default"),
      description: `Default address book`,
      synctoken: 1,
    },
  })

  const baikalCalendar = await baikalDB.calendar.create({
    data: {
      synctoken: 1,
      components: Buffer.from("VEVENT,VTODO"),
    },
  })

  const baikalCalendarInstance = await baikalDB.calendarInstance.create({
    data: {
      calendarid: baikalCalendar.id,
      principaluri: Buffer.from(`principals/${username}`),
      displayname: "Default",
      uri: Buffer.from("default"),
    },
  })

  return true
}

export default createBaikalUserWithDefaultCalendar
