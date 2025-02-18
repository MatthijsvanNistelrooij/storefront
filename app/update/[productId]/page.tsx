"use client"
import React from "react"
import UpdateProductForm from "@/components/UpdateProductForm"
import { use } from "react" // Import use from React
import Link from "next/link"

const UpdateProductPage = ({ params }: { params: { productId: string } }) => {
  const { productId } = use(params)



  return (
    <div className="container mx-auto p-4 max-w-xl mt-40">
      <h1 className="text-2xl font-semibold">Update Product {productId}</h1>
      <UpdateProductForm
        productId={productId}
        currentTitle={productId}
        currentPrice={productId}
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
