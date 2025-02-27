import { client } from "../client/client"

export const removeCartLine = async (cartId: string, lineId: string) => {
  if (!cartId) {
    console.error("Cart ID is required but received undefined")
    return null
  }

  const query = `
    mutation removeCartLine($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          lines(first: 10) {
            edges {
              node {
                id
                quantity
                merchandise {
                  __typename
                  ... on ProductVariant {
                    id
                    title
                    product {
                      title
                      handle
                    }
                  }
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
        warnings {
          message
        }
      }
    }
  `

  const variables = { cartId, lineIds: [lineId] }

  try {
    const response = await client.request(query, { variables })

    return response?.data.cartLinesRemove?.cart
  } catch (error) {
    console.error("Error removing cart line:", error)
    return null
  }
}
