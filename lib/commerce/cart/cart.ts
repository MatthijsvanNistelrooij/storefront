import { client } from "../client/client"
import { z } from "zod"

const cartItemSchema = z.object({
  id: z.string(),
  quantity: z.number(),
  merchandise: z.object({
    id: z.string(),
    title: z.string(),
    product: z.object({
      title: z.string(),
      handle: z.string(),
    }),
    image: z
      .object({
        url: z.string().url(),
        altText: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    priceV2: z
      .object({
        amount: z.string(),
        currencyCode: z.string(),
      })
      .optional(),
  }),
})

const cartSchema = z.object({
  id: z.string(),
  totalQuantity: z.number(),
  checkoutUrl: z.string(),
  lines: z.object({
    edges: z.array(
      z.object({
        node: cartItemSchema,
      })
    ),
  }),
  estimatedCost: z.object({
    totalAmount: z.object({
      amount: z.string(),
      currencyCode: z.string(),
    }),
  }),
})

export type Cart = z.infer<typeof cartSchema>

const cartQuery = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        totalQuantity
        checkoutUrl
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                    handle
                  }
                  priceV2 {
                    amount
                    currencyCode
                  }
                  image {
                    url
                  }
                }
              }
            }
          }
        }
        estimatedCost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
    }
  `

export const getCart = async (cartId: string): Promise<Cart | null> => {
  try {
    const response = await client.fetch(cartQuery, {
      variables: { cartId },
    })

    if (!response.ok) {
      console.error("Failed to fetch cart", response.status)
      return null
    }

    const { data } = await response.json()

    const parsedData = cartSchema.safeParse(data.cart)

    if (!parsedData.success) {
      console.error("Cart data validation failed", parsedData.error)
      return null
    }

    return parsedData.data
  } catch (error) {
    console.error("Error fetching cart:", error)
    return null
  }
}
