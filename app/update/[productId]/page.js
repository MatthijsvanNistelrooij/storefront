"use client"
import React, { useState, useEffect } from "react"
import UpdateProductForm from "@/components/UpdateProductForm"
import { use } from "react" // Import use from React
import Link from "next/link"

const UpdateProductPage = ({ params }) => {
  const { productId } = use(params) // Unwrap the promise using React.use()

  const [productDetails, setProductDetails] = useState({
    title: "",
    price: "",
    id: "",
  })

  useEffect(() => {
    if (!productId) return

    const actualProductId = productId.split("/").pop() // Extract numeric ID from 'gid' format

    const fetchProductDetails = async () => {
      try {
        const response = await fetch(
          `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/admin/api/2023-10/products/${actualProductId}.json`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token":
                process.env.NEXT_PUBLIC_SHOPIFY_ADMIN_API_ACCESS_TOKEN,
            },
          }
        )
        const data = await response.json()

        if (data.product) {
          const { title, variants } = data.product
          const price = variants[0]?.price || ""
          setProductDetails({
            title,
            price,
            id: actualProductId,
          })
        }
      } catch (error) {
        console.error("❌ Error fetching product details:", error)
      }
    }

    fetchProductDetails()
  }, [productId])

  //   if (!productDetails.id) {
  //     return <p>Loading...</p>
  //   }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold">Update Product</h1>
      <UpdateProductForm
        productId={productDetails.id}
        currentTitle={productDetails.title}
        currentPrice={productDetails.price}
      />
      <div>
        <Link
          href={"/"}
          className="text-center block w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-700 mt-20"
        >
          TERUG
        </Link>
      </div>
    </div>
  )
}

export default UpdateProductPage
