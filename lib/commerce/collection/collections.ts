import { client } from "../client/client"
import { z } from "zod"

const productSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  handle: z.string(),
  images: z.object({
    nodes: z
      .array(
        z.object({
          url: z.string().url(),
          altText: z.string().nullable(),
        })
      )
      .min(1),
  }),
  variants: z.object({
    nodes: z
      .array(
        z.object({
          id: z.string(),
          price: z.object({
            amount: z.string().refine((val) => !isNaN(parseFloat(val)), {
              message: "Amount must be a valid number",
            }),
            currencyCode: z.string(),
          }),
        })
      )
      .min(1),
  }),
})

const collectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  handle: z.string(),
  products: z.object({
    nodes: z.array(productSchema),
  }),
})

const collectionsSchema = z.object({
  collections: z.object({
    nodes: z.array(collectionSchema),
  }),
})

const collectionsQuery = `
  query getCollections {
    collections(first: 10) {
      nodes {
        id
        title
        description
        handle
        products(first: 10) {
          nodes {
            id
            title
            handle
            images(first: 1) {
              nodes {
                url
                altText
              }
            }
            variants(first: 1) {
              nodes {
                id
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`

export type Product = z.infer<typeof productSchema>
export type Collection = z.infer<typeof collectionSchema>
export type Collections = z.infer<typeof collectionsSchema>

export const getCollections = async (): Promise<Collection[] | null> => {
  try {
    const response = await client.fetch(collectionsQuery)

    if (!response.ok) {
      console.error("Failed to fetch collections", response.status)
      return null
    }

    const { data } = await response.json()
    const parsedData = collectionsSchema.safeParse(data)

    if (!parsedData.success) {
      console.error("Collections data validation failed", parsedData.error)
      return null
    }

    return parsedData.data.collections.nodes
  } catch (error) {
    console.error("Error fetching collections:", error)
    return null
  }
}
