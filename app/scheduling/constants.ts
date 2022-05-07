export const initialSchedule = {
  monday: { blocked: false, start: "09:00", end: "17:00" },
  tuesday: { blocked: false, start: "09:00", end: "17:00" },
  wednesday: { blocked: false, start: "09:00", end: "17:00" },
  thursday: { blocked: false, start: "09:00", end: "17:00" },
  friday: { blocked: false, start: "09:00", end: "17:00" },
  saturday: { blocked: true, start: "09:00", end: "17:00" },
  sunday: { blocked: true, start: "09:00", end: "17:00" },
}

export const messages = {
  noName: "Please enter a name",
  noUsername: "Please enter a username",
  noPassword: "Please enter a password",
  noLink: "Please enter an identifier for your link",
  noDescription: "Please enter a description",
  noLocation: "Please enter a location",
  shortUsername: "Username has to be at least 2 characters",
  invalidEmail: "Please enter a valid email address",
  shortPassword: "Password must contain at least 10 characters",
  longPassword: "Password cannot contain more than 100 characters",
  invalidUrl: "Please enter a valid url",
  invalidNotificationMinutes: "Please leave this field blank or enter a positive number.",
}
