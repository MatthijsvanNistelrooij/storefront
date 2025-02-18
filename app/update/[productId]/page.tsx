"use client"
import React, { useState, useEffect } from "react"
import UpdateProductForm from "@/components/UpdateProductForm"
import { use } from "react" // Import use from React
import Link from "next/link"

const UpdateProductPage = ({ params }: { params: { productId: string } }) => {
  const { productId } = use(params)

  const [productDetails, setProductDetails] = useState({
    title: "",
    price: "",
    id: "",
  })

  useEffect(() => {
    if (!productId) return

    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch product details")
        }

        const data = await response.json()
        setProductDetails({
          title: data.title,
          price: data.price,
          id: productId,
        })
      } catch (error) {
        console.error("❌ Error fetching product:", error)
      }
    }

    fetchProductDetails()
  }, [productId])

  return (
    <div className="container mx-auto p-4 max-w-xl mt-40">
      <h1 className="text-2xl font-semibold">Update Product {productId}</h1>
      <UpdateProductForm
        productId={productId}
        currentTitle={productDetails.title}
        currentPrice={productDetails.price}
      />
      <div className="w-full pt-20">
        <Link
          href={"/"}
          className="w-full block mt-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 text-center"
        >
          Back
        </Link>
      </div>
    </div>
  )
}

export default UpdateProductPage
