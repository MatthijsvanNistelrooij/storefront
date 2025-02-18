import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" }) // Reject non-POST requests
  }

  const { productId } = req.body // ✅ Get productId from request body

  if (!productId) {
    return res.status(400).json({ error: "Missing productId" })
  }

  try {
    const query = `
      query {
        product(id: "gid://shopify/Product/${productId}") {
          title
          variants(first: 1) {
            edges {
              node {
                price
              }
            }
          }
        }
      }
    `

    const url = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
      },
      body: JSON.stringify({ query }),
    })

    const data = await response.json()

    if (!response.ok || !data?.data?.product) {
      return res.status(500).json({ error: "Failed to fetch product" })
    }

    const product = data.data.product
    const price = product.variants?.edges[0]?.node?.price || ""

    res.status(200).json({
      id: productId,
      title: product.title,
      price,
    })
  } catch (error) {
    console.error("❌ Error fetching product:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
