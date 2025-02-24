"use client"
import React from "react"
import UpdateProductForm from "@/components/UpdateProductForm"
import { use } from "react" // Import use from React
import Link from "next/link"

const UpdateProductPage = ({ params }) => {
  const { productId } = use(params) // Unwrap the promise using React.use()

  console.log(productId)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold">Update Product</h1>
      <UpdateProductForm
        productId={productId}
        currentTitle={""}
        currentPrice={""}
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
