import { updateProduct } from "@/utils/shopify"
import React, { useState } from "react"

const UpdateProductForm = ({
  productId,
  currentTitle,
  currentPrice,
}: {
  productId: string
  currentTitle: string
  currentPrice: string
}) => {
  const [title, setTitle] = useState(currentTitle)
  const [price, setPrice] = useState(currentPrice)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    const updatedData = { title, price }

    try {
      const response = await updateProduct(productId, updatedData)
      console.log("✅ Product updated successfully", response)
    } catch (error) {
      console.error("❌ Error updating product", error)
    }
  }

  return (
    <div>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Product Title
          </label>
          <input
            id="title"
            value={title}
            placeholder="type anything..."
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-500"
          />
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700"
          >
            Product Price
          </label>
          <input
            id="price"
            type="number"
            placeholder="type anything..."
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-500"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Update Product
        </button>
      </form>
    </div>
  )
}

export default UpdateProductForm
