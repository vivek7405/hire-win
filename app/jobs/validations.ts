import { z } from "zod"

// type Literal = boolean | null | number | string
// type Json = Literal | { [key: string]: Json } | Json[]
// const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])
// const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
//   z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
// )

export const Job = z.object({
  name: z.string().nonempty({ message: "Name can't be empty" }),
  description: z.any(),
  categoryId: z.string().optional(),
  workflowId: z.string().optional(),
  slug: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
})

export type JobInputType = z.infer<typeof Job>
