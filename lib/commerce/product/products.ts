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

const productsSchema = z.object({
  products: z.object({
    nodes: z.array(productSchema),
  }),
})

const productQuery = `
  query getProducts($first: Int!) {
    products(first: $first) {
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
`

export type Product = z.infer<typeof productSchema>

export const getProducts = async (first: number = 10) => {
  try {
    const response = await client.fetch(productQuery, {
      variables: { first },
    })

    if (!response.ok) {
      console.error("Failed to fetch products", response.status)
      return []
    }

    const { data } = await response.json()

    const parsedData = productsSchema.safeParse(data)
    if (!parsedData.success) {
      console.error("Product data validation failed", parsedData.error)
      return []
    }

    return parsedData.data.products.nodes
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}
