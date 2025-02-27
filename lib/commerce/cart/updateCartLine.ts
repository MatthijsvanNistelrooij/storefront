import { client } from "../client/client"

export const updateCartLine = async (
  cartId: string,
  lineId: string,
  quantity: number
) => {
  if (!cartId) {
    console.error("Cart ID is required but received undefined")
    return null
  }

  const query = `
    mutation updateCartLine($cartId: ID!, $lineId: ID!, $quantity: Int!) {
      cartLinesUpdate(cartId: $cartId, lines: [{ id: $lineId, quantity: $quantity }]) {
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
      }
    }
  `

  const variables = { cartId, lineId, quantity }

  try {
    const response = await client.request(query, { variables })

    return response?.data.cartLinesUpdate?.cart
  } catch (error) {
    console.error("Error updating cart line:", error)
    return null
  }
}
