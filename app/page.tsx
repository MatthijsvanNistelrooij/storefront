"use client"
import { useEffect, useState } from "react"
import { GraphQLClient } from "graphql-request"
import Image from "next/image"
import Link from "next/link"

interface Product {
  id: string
  title: string
  handle: string
  imageSrc: string
  imageAlt: string
  price: string
  currencyCode: string
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])

  console.log("products", products)

  const productIds = products.map((product) => product.id)

  console.log("All product IDs:", productIds)

  const shopifyClient = new GraphQLClient(
    `https://${process.env
      .NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!}/api/2023-10/graphql.json`,
    {
      headers: {
        "X-Shopify-Storefront-Access-Token":
          process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
        "Content-Type": "application/json",
      },
    }
  )

  console.log(
    "✅ GraphQL Client initialized with domain:",
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
  )

  const fetchProducts = async () => {
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
      const data = await shopifyClient.request(query, { first: 5 })

      console.log("✅ Data received:", data)
      const fetchedProducts = data.products.edges.map(({ node }) => ({
        id: node.id,
        title: node.title,
        handle: node.handle,
        imageSrc: node.images.edges[0]?.node.url || "",
        imageAlt: node.images.edges[0]?.node.altText || "Product Image",
        price: node.variants.edges[0]?.node.priceV2.amount || "0.00",
        currencyCode:
          node.variants.edges[0]?.node.priceV2.currencyCode || "USD",
      }))
      setProducts(fetchedProducts)
    } catch (error) {
      console.error("❌ Error fetching products:", error.response || error)
    }
  }

  useEffect(() => {
    console.log("🔄 Running useEffect...")
    fetchProducts()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg shadow-lg p-4 flex flex-col items-center"
            >
              <Image
                src={product.imageSrc}
                alt={product.imageAlt}
                width={200}
                height={200}
                className="rounded-md"
              />
              <h2 className="text-xl font-semibold mt-4">{product.title}</h2>
              <p className="text-gray-600">
                {product.price} {product.currencyCode}
              </p>
              <Link
                href={`https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/products/${product.handle}`}
                target="_blank"
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                View in Webshop
              </Link>
              <Link
                href={`update/${product.id.split("/").pop()}`}
                passHref
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                UPDATE PRODUCT
              </Link>
            </div>
          ))
        ) : (
          <p>Loading products...</p>
        )}
      </div>
    </div>
  )
}
