
export const updateCartLine = async (
    cartId: string | undefined,
    lineId: string,
    quantity: number
  ) => {
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
  
    const variables = {
      cartId,
      lineId,
      quantity,
    }
  
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2025-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token":
            process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      }
    )
  
    const data = await response.json()
  
    if (data.errors) {
      console.error("Error updating cart line:", data.errors)
      return null
    }
  
    return data.data.cartLinesUpdate.cart
  }