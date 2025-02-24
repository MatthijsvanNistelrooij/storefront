"use client"
import React, { useEffect, useState } from "react"
import Image from "next/image"
import {
  addToCart,
  fetchProducts,
  fetchShopInfo,
  Product,
} from "@/lib/commerce"
import Link from "next/link"

const Home = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [shop, setShop] = useState<null | {
    name: string
    description: string
    primaryDomain: { url: string } | null
  }>(null)

  useEffect(() => {
    fetchShopInfo().then(setShop)
    fetchProducts().then(setProducts)
  }, [])

  console.log("products", products)

  const getCartId = () => localStorage.getItem("shopifyCartId")
  const cartId = getCartId()
  const extractedCartId = cartId?.split("/").pop()

  console.log("products", products)
  return (
    <div className="p-8">
      <Link href={`/cart/${extractedCartId}`}>Cart</Link>
      <div>
        {shop ? (
          <>
            <h1>name: {shop.name}</h1>
            <p>descr: {shop.description ? shop.description : "empty"} </p>
            <Link
              className="text-blue-300 text-sm"
              href={shop?.primaryDomain?.url || "/"}
              target="_blank"
            >
              Visit Store
            </Link>
          </>
        ) : (
          <p>Loading store info...</p>
        )}
      </div>
      <h1 className="text-3xl font-bold mb-6">Shopify Products</h1>
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
                width={"100"}
                height={"100"}
                className="rounded-md"
                priority
              />
              <h2 className="text-xl font-semibold mt-4">{product.title}</h2>
              <p className="text-gray-600">
                {product.price} {product.currencyCode}
              </p>

              <button
                onClick={() => addToCart(product.id, 1, product.variants[0].id)}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                🛒 Add to Cart
              </button>

              <Link
                href={`https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/products/${product.handle}`}
                target="_blank"
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                View in Webshop
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

export default Home
