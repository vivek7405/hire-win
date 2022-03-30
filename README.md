# Documentation

## Overview

To get started, you’ll need the following:

- Postgres database
- Blitzjs
- Stripe CLI
- Stripe API keys
- Object storage with S3 styled credentials (minio for development)

Create an `.env.local` file with all your key credentials.

```
POSTMARK_TOKEN=
SESSION_SECRET_KEY= [generate using openssl rand -hex 16]
S3_BUCKET=hire-win
S3_ENDPOINT=http://localhost:9000
S3_SECRET_KEY=minioadmin
STRIPE_SECRET=
NEXT_PUBLIC_STRIPE_PUBLIC=
PRO_PLAN=
STRIPE_WEBHOOK=
NEXT_PUBLIC_APP_URL=http://localhost:3000
S3_ACCESS_KEY=minioadmin
```

Before starting the server, ensure your database is connected and up to date by running the command:

`blitz prisma migrate dev`

Then to start the server run the following commands in separate terminal windows:

`yarn run stripe:dev`

`yarn dev`

hire-win should now be accessible from `http://localhost:3000`

## Roles & Permissions

There are 2 types of roles. A global role for a user and local role set on the membership associated with the workspace.

The global role by default can either be “**USER**” or “**ADMIN**”, giving you the flexibility to set global permissions based on the user’s role.

A local role is set when creating a membership on a workspace. When a user creates a workspace, the `createWorkspace` mutation will create a membership with the “**OWNER**” role.

Permissions are set in a central file with Blitz-Guard. Permissions for the `updateWorkspace` mutation and `getWorkspace` query are included.

The `updateWorkspace` mutations guard checks to see if the current user membership with the workspace has the “**OWNER**” or "**ADMIN**" role.

Only the owner of a workspace has access to the billing page of a workspace. You can set which member is an admin in your workspace settings page. There is included guards to check if a member is an admin or owner. For example:

```tsx
const { can: isOwner } = await Guard.can(
  "isOwner",
  "workspace",
  { session },
  { where: { slug: context?.params?.slug as string } }
)
```

and

```tsx
const { can: isAdmin } = await Guard.can(
  "isOwner",
  "workspace",
  { session },
  { where: { slug: context?.params?.slug as string } }
)
```

These guards only work for workspaces. You must supply the workspace slug to the Guard function.

The `getWorkspace` query guard just checks if the current user has a membership with the workspace.

You can create your own guard logic inside the `ability.ts` file. Check the example section on how to create a guard that checks what plan the workspace is subscribed too.

## Payments

Processing is handled by Stripe Checkout. Plans are created on stripe where you copy the price id set in your .env file to the `app > core > utils > plans.ts` file.

Plans are billed per workspace. When your user completes the stripe checkout process a ping hits `/api/stripe` where the `subscriptionId` will be set on the workspace.

## File Uploads

There are 2 api routes for uploading and removing files from your s3 style object storage:

`/api/files/uploadFile.ts`

`/api/files/removeFile.ts`

Upload returns the following object `{ Location: string, Key: string }`

An upload component is also included at `app > core > components > SingleFileUpload.tsx`. It's made with `react-dropzone` and meant to work with `react-hook-forms`. The component automatically works with the supplied API routes.

## API Key Management

You can generate API keys per workspace. There is a `PUBLIC_KEY` & `SECRET_KEY`. The difference is the public key stores the non-hashed version for abbreviation purposes and always stays the same, like a "username". The secret key can only be seen once when creating a new key. You can create as many secret keys that you want.

There is an included function `app > core > utils > checkToken.ts` that requires you to pass your request, response & a whether or not the route is a public route. A public route means only a `PUBLIC_KEY` is required for the check to pass.

```tsx
const token = await checkToken(req, res, { PUBLIC: false })
```

The `checkToken` function will return the workspace id that is associated with the API keys if all checks are valid.

## Admin Panel

There is a preconfigured admin panel, along with a blitz recipe to generate admin pages, queries and mutations from your prisma schema.

To run the generator, issue the following command:

`yarn generate:admin`

The generator will traverse your prisma schema and only generate the associated files that haven't been generated before. So you don't have to worry about duplicates.

The preconfigured admin panel comes with a dashboard that showcases how many paying customers you have, and how many has churned.

Another special feature included with the admin panel will allow admins to set a workspace plan. It's important to note, that when setting a workspace plan as an admin that the owner of the workspace will be given a **7 day free trial** before having to enter their payment info. This also gives the owner of the workspace a chance to opt out, incase an admin subscribes the workspace to an expensive plan the workspace owner never wanted.

You can change how long the free trial is inside `app > admin > mutations > updateWorkspace.ts`. The specific code is found on line 58:

```tsx
const subscription = await stripe.subscriptions.create({
  customer: workspace.stripeCustomerId ? workspace.stripeCustomerId : customer.id,
  items: [
    {
      price: data.stripePriceId as string,
      quantity: workspace?.memberships.length,
    },
  ],
  trial_period_days: 7,
})
```

## Tests

Cypress E2E tests are included. The following is tested:

- User signup
- Only workspace owners can invite users
- Only users invited to a workspace can view that workspace
- Inviting a user successfully adds them to the workspace

To run the tests, make sure you're connecting to an alternate test database set in a `.env.test.local` file.

Then run in the following order:

`yarn seed:db`

`yarn test:e2e`

## Examples

### Customizing a guard that checks the workspace plan

Of course you're going to want different plans that allow for different features. This is how you do it:

Head to the `app > guard > ability.ts` file. You're going to import the `app > workspaces > utils > checkPlan.ts` utility function and check to see which plan the workspace is subscribed to. Then if they're subscribed to a plan, we'll allow the user to run the `getWorkspace` query. Allowing them to view their workspace page.

Inside the `can("read", "workspace")`, we'll add the following code to check if the workspace being viewed is subscribed to the `pro` plan:

```tsx
can("read", "workspace", async (args) => {
  const workspace = await db.workspace.findFirst({
    where: args.where,
    include: {
      memberships: true,
    },
  })

  const plan = checkPlan(workspace)

  return (
    workspace?.memberships.some((p) => p.userId === ctx.session.userId) === true && plan === "pro"
  )
})
```
