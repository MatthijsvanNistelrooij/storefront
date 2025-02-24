import { createStorefrontApiClient } from "@shopify/storefront-api-client"
import { GraphQLClient } from "graphql-request"

export const client = createStorefrontApiClient({
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!,
  apiVersion: "2025-01",
  publicAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
})

export interface Product {
  id: string
  title: string
  handle: string
  imageSrc: string
  imageAlt: string
  price: string
  currencyCode: string
  variants: Variant[]
}

export interface Variant {
  id: string
  title: string
  price: string
  currencyCode: string
}

export interface Collection {
  id: string
  title: string
  handle: string
  descriptionHtml: string
  products: Product
}

export interface CollectionsResponse {
  collections: {
    edges: {
      node: Collection
    }[]
  }
}

export interface PrimaryDomain {
  url: string
}

export interface Shop {
  name: string
  description: string
  primaryDomain: PrimaryDomain
}

interface ShopifyResponse {
  collections?: {
    edges: {
      node: Collection
    }[]
  }
  shop: {
    name: string
    description: string
    primaryDomain: {
      url: string
    }
  }
  products: {
    edges: {
      node: {
        id: string
        title: string
        handle: string
        images: {
          edges: {
            node: {
              url: string
              altText: string | null
            }
          }[]
        }
        variants: {
          edges: {
            node: {
              id: string
              priceV2: {
                amount: string
                currencyCode: string
              }
            }
          }[]
        }
      }
    }[]
  }
  cart?: {
    id: string
    lines: {
      edges: {
        node: {
          id: string
          quantity: number
          merchandise: {
            title: string
            priceV2: {
              amount: string
              currencyCode: string
            }
          }
        }
      }[]
    }
    cost: {
      subtotalAmount: {
        amount: string
        currencyCode: string
      }
      totalAmount: {
        amount: string
        currencyCode: string
      }
    }
  }
}

export interface CartResponse {
  cart: {
    id: string
    totalQuantity: number
    checkoutUrl: string
    lines: {
      edges: {
        node: {
          id: string
          quantity: number
          merchandise: {
            id: string
            title: string
            product: {
              title: string
            }
            priceV2: {
              amount: string
              currencyCode: string
            }
            image?: {
              url: string
            }
          }
        }
      }[]
    }
    estimatedCost: {
      totalAmount: {
        amount: string
        currencyCode: string
      }
    }
  }
}

interface CartItem {
  id: string
  quantity: number
  title: string
  variantId: string
  variantTitle: string
  price: string
  currencyCode: string
  imageSrc: string
}

export interface Cart {
  id: string
  totalQuantity: number
  checkoutUrl: string
  totalAmount: string
  currencyCode: string
  items: CartItem[]
}

const shopifyClient = new GraphQLClient(
  `https://${process.env
    .NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!}/api/2025-01/graphql.json`,
  {
    headers: {
      "X-Shopify-Storefront-Access-Token":
        process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
      "Content-Type": "application/json",
    },
  }
)

export const fetchProducts = async (): Promise<Product[]> => {
  console.log("📡 Fetching products from Shopify...")

  const query = `
    query getProducts($first: Int) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  priceV2 {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `

  try {
    console.log("🚀 Sending GraphQL request...")
    const data = await shopifyClient.request<ShopifyResponse>(query, {
      first: 5,
    })
    console.log("✅ Data received:", data)

    return data.products.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      variants: node.variants.edges.map(({ node }) => ({
        id: node.id,
        title: node.priceV2.amount || "Variant Title Not Available",
        price: node.priceV2.amount,
        currencyCode: node.priceV2.currencyCode,
      })),
      imageSrc: node.images.edges[0]?.node.url || "",
      imageAlt: node.images.edges[0]?.node.altText || "Product Image",
      price: node.variants.edges[0]?.node.priceV2.amount || "0.00",
      currencyCode: node.variants.edges[0]?.node.priceV2.currencyCode || "USD",
    }))
  } catch (error) {
    console.error("❌ Error fetching products:", error)
    return []
  }
}

export const fetchShopInfo = async () => {
  const query = `
      query getShopInfo {
        shop {
          name
          description
          primaryDomain {
            url
          }
          moneyFormat
        }
      }
    `

  try {
    const data = await shopifyClient.request<ShopifyResponse>(query, {
      first: 5,
    })
    console.log("🏪 Store Info:", data)
    return data.shop
  } catch (error) {
    console.error("❌ Error fetching store info:", error)
    return null
  }
}

export const fetchCart = async (cartId: string): Promise<Cart | null> => {
  console.log("📡 Fetching cart from Shopify...")

  const query = `
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

  try {
    console.log("🚀 Sending GraphQL request!...")
    const data = await shopifyClient.request<CartResponse>(query, { cartId })
    console.log("✅ Cart data received:", data)

    return {
      id: data.cart.id,
      totalQuantity: data.cart.totalQuantity,
      checkoutUrl: data.cart.checkoutUrl,
      totalAmount: data.cart.estimatedCost.totalAmount.amount,
      currencyCode: data.cart.estimatedCost.totalAmount.currencyCode,
      items: data.cart.lines.edges.map(({ node }) => ({
        id: node.id,
        quantity: node.quantity,
        title: node.merchandise.product.title,
        variantId: node.merchandise.id,
        variantTitle: node.merchandise.title,
        price: node.merchandise.priceV2.amount,
        currencyCode: node.merchandise.priceV2.currencyCode,
        imageSrc: node.merchandise.image?.url || "",
      })),
    }
  } catch (error) {
    console.error("❌ Error fetching cart:", error)
    return null
  }
}

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

export const getCartId = () => localStorage.getItem("shopifyCartId")

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
    const data = await shopifyClient.request<{
      cartCreate: { cart: { id: string; checkoutUrl: string } }
    }>(mutation)

    const newCart = {
      id: data.cartCreate.cart.id,
      totalQuantity: 0,
      checkoutUrl: data.cartCreate.cart.checkoutUrl,
      totalAmount: "0.00",
      currencyCode: "USD",
      items: [],
    }

    localStorage.setItem("shopifyCartId", newCart.id)
    return newCart
  } catch (error) {
    console.error("❌ Error creating cart:", error)
    return null
  }
}

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

export const removeCartLine = async (
  cartId: string | undefined,
  lineId: string
) => {
  const query = `
    mutation removeCartLine($cartId: ID!, $lineId: ID!) {
      cartLinesRemove(cartId: $cartId, lineIds: [$lineId]) {
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
    console.error("Error removing cart line:", data.errors)
    return null
  }

  return data.data.cartLinesRemove.cart
}
