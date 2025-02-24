export async function PUT(req) {
  try {
    const { productId, updatedData } = await req.json()

    console.log("Received Product ID:", productId)
    console.log("Received Update Data:", updatedData)

    const accessToken = process.env.NEXT_PUBLIC_SHOPIFY_ADMIN_API_ACCESS_TOKEN
    const shopifyStoreDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN

    const url = `https://${shopifyStoreDomain}/admin/api/2023-10/products/${productId}.json`

    const requestBody = JSON.stringify({
      product: {
        id: productId,
        title: updatedData.title || undefined,
        variants: [
          {
            price: updatedData.price || undefined,
          },
        ],
      },
    })

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken!,
        Accept: "application/json",
      },
      body: requestBody,
    })

    const responseText = await response.text()
    console.log("Raw Response:", responseText)

    if (response.ok) {
      const data = JSON.parse(responseText)
      return new Response(JSON.stringify(data), { status: 200 })
    } else {
      console.error("Error response:", responseText)
      return new Response(
        JSON.stringify({
          error: "Failed to update product",
          details: responseText,
        }),
        { status: response.status }
      )
    }
  } catch (error) {
    console.error("Error updating product:", error)
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
    })
  }
}

// export async function POST(req: Request) {
//   try {
//     const { productId, quantity, cartId } = await req.json()

//     console.log("Received Product ID:", productId)
//     console.log("Received Quantity:", quantity)
//     console.log("Received Cart ID:", cartId)

//     const shopifyStoreDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
//     const accessToken = process.env.NEXT_PUBLIC_SHOPIFY_ADMIN_API_ACCESS_TOKEN

//     if (!productId) {
//       return new Response(JSON.stringify({ error: "Product ID is required" }), {
//         status: 400,
//       })
//     }

//     const url = `https://${shopifyStoreDomain}/api/2023-10/graphql.json`

//     const requestBody = JSON.stringify({
//       query: `
//         mutation addToCart($cartId: ID, $lines: [CartLineInput!]!) {
//           cartLinesAdd(cartId: $cartId, lines: $lines) {
//             cart {
//               id
//               totalQuantity
//               lines(first: 10) {
//                 edges {
//                   node {
//                     id
//                     quantity
//                     merchandise {
//                       ... on ProductVariant {
//                         id
//                         title
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//             userErrors {
//               field
//               message
//             }
//           }
//         }
//       `,
//       variables: {
//         cartId: cartId || null, // If no cart exists, Shopify will create a new one
//         lines: [{ merchandiseId: productId, quantity: quantity || 1 }],
//       },
//     })

//     console.log("Request Body:", requestBody)

//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "X-Shopify-Storefront-Access-Token": accessToken,
//       },
//       body: requestBody,
//     })

//     const responseText = await response.text()
//     console.log("Raw Response:", responseText)

//     const data = JSON.parse(responseText)

//     if (data.errors || data.data?.cartLinesAdd?.userErrors?.length) {
//       console.error(
//         "Shopify API Errors:",
//         data.errors || data.data.cartLinesAdd.userErrors
//       )
//       return new Response(
//         JSON.stringify({
//           error: "Failed to add to cart",
//           details: data.errors || data.data.cartLinesAdd.userErrors,
//         }),
//         { status: 400 }
//       )
//     }

//     return new Response(
//       JSON.stringify({
//         success: true,
//         cartId: data.data.cartLinesAdd.cart.id, // Store this in localStorage
//         totalQuantity: data.data.cartLinesAdd.cart.totalQuantity,
//       }),
//       { status: 200 }
//     )
//   } catch (error) {
//     console.error("Error adding to cart:", error)
//     return new Response(JSON.stringify({ error: "Something went wrong" }), {
//       status: 500,
//     })
//   }
// }
