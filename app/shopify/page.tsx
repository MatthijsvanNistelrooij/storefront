"use client"
import React, { useEffect, useState } from "react"
import Image from "next/image"
import {
  Collection,
  fetchCollection,
  fetchCollections,
  fetchProducts,
  fetchShopInfo,
} from "@/lib/commerce"
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

const Home = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [collection, setCollection] = useState<Collection[]>([])

  console.log("collections", collections)
  console.log("collection", collection)

  const [shop, setShop] = useState<null | {
    name: string
    description: string
    moneyFormat?: string
    primaryDomain: { url: string } | null
  }>(null)

  useEffect(() => {
    fetchShopInfo().then(setShop)
  }, [])

  useEffect(() => {
    console.log("🔄 Running useEffect...")
    fetchProducts().then(setProducts)
  }, [])

  useEffect(() => {
    fetchCollections().then((collection) => {
      console.log("Collections:", collection)
      fetchProducts().then(setCollections)
    })
  }, [])

  useEffect(() => {
    fetchCollection("Home Page").then((collection) => {
      console.log("Collection:", collection)
      fetchProducts().then(setCollection)
    })
  }, [])

  return (
    <div className="p-8">
      <Link href={"/"}>Home</Link>
      <div>
        {shop ? (
          <>
            <h1>{shop.name}</h1>
            <p>{shop.description}</p>
            <Link href={shop?.primaryDomain?.url || "/"} target="_blank">
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

export default Home
