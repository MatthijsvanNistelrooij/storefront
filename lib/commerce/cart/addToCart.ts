import { client } from "../client/client"

export const addToCart = async (
  productId: string,
  quantity: number,
  variantId: string
) => {
  if (!productId) {
    console.error("❌ No product ID available")
    return
  }
  let cartId = localStorage.getItem("shopifyCartId")

  if (!cartId) {
    console.log("🛒 No cart found, creating a new one...")

    const newCart = await createCart()

    if (!newCart || !newCart.id) {
      console.error("❌ Failed to create a new cart")
      alert("Failed to create a cart. Please try again.")
      return
    }

    cartId = newCart.id
    localStorage.setItem("shopifyCartId", cartId)
  }

  const cleanCartId = cartId

  const cartUrl = cleanCartId.split("/Cart")[1]

  const cleanProductId = productId.split("/") || ""

  if (!cleanCartId || !cleanProductId) {
    console.error("❌ Invalid cartId or productId")
    return
  }

  const cartLinesAddMutation = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          lines(first: 5) {
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
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const variables = {
    cartId: cartId,
    lines: [
      {
        merchandiseId: `${variantId}`,
        quantity: quantity,
        attributes: [],
        sellingPlanId: null,
      },
    ],
  }

  const options = {
    variables,
  }

  try {
    const response = await client.request(cartLinesAddMutation, options)
    console.log("✅ Added to cart:", response)

    window.location.href = `/cart${cartUrl}`
  } catch (error) {
    console.error("❌ Error adding product to cart:", error)
    console.log("Failed to add to cart.")
  }
}

export const createCart = async () => {
  const mutation = `
        mutation {
          cartCreate {
            cart {
              id
              checkoutUrl
            }
          }
        }
      `

  try {
    console.log("🛒 Creating new cart...")
    const data = await client.request<{
      cartCreate: { cart: { id: string; checkoutUrl: string } }
    }>(mutation)

    const newCart = {
      id: data.data?.cartCreate.cart.id,
      totalQuantity: 0,
      checkoutUrl: data.data?.cartCreate.cart.checkoutUrl,
      totalAmount: "0.00",
      currencyCode: "USD",
      items: [],
    }

    localStorage.setItem("shopifyCartId", newCart.id || "")
    return newCart
  } catch (error) {
    console.error("❌ Error creating cart:", error)
    return null
  }
}
