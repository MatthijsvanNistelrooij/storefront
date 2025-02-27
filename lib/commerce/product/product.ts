import { client } from "../client/client"
import { z } from "zod"

const productSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
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

const singleProductSchema = z.object({
  product: productSchema.nullable(),
})

const productQuery = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
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
`

export type Product = z.infer<typeof productSchema>

export const getProduct = async (handle: string): Promise<Product | null> => {
  try {
    const response = await client.fetch(productQuery, {
      variables: { handle },
    })

    if (!response.ok) {
      console.error("Failed to fetch product", response.status)
      return null
    }

    const { data } = await response.json()
    const parsedData = singleProductSchema.safeParse(data)

    if (!parsedData.success) {
      console.error("Product data validation failed", parsedData.error)
      return null
    }

    return parsedData.data.product
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}
