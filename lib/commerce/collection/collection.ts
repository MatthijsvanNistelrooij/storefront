import { client } from "../client/client"
import { z } from "zod"

const productSchema = z.object({
  id: z.string(),
  title: z.string(),
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
  products: z.object({
    nodes: z.array(productSchema),
  }),
})

const collectionQuery = `
  query getCollection($handle: String!) {
    collection(handle: $handle) {
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
`

export type Product = z.infer<typeof productSchema>
export type Collection = z.infer<typeof collectionSchema>

export const getCollection = async (
  handle: string
): Promise<Product[] | null> => {
  try {
    const response = await client.fetch(collectionQuery, {
      variables: { handle },
    })

    if (!response.ok) {
      console.error("Failed to fetch collection", response.status)
      return null
    }

    const { data } = await response.json()
    const parsedData = collectionSchema.safeParse(data.collection)

    if (!parsedData.success) {
      console.error("Collection data validation failed", parsedData.error)
      return null
    }

    return parsedData.data.products.nodes
  } catch (error) {
    console.error("Error fetching collection:", error)
    return null
  }
}
