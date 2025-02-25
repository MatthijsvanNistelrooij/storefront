"use client"
import { getProduct, Product } from "@/lib/commerce/product/product"
import Image from "next/image"
import { notFound } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { Minus, Plus } from "lucide-react"
import { addToCart } from "@/lib/commerce/cart/addToCart"
import usePriceFormatter from "@/hooks/usePriceFormatter"

const ProductDetails = () => {
  const { productId } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [edit, setEdit] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const formatPrice = usePriceFormatter()

  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return
      const id = Array.isArray(productId) ? productId[0] : productId
      const data = await getProduct(id)
      setProduct(data)
      setLoading(false)
    }
    fetchProduct()
  }, [productId])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setEdit(false)
      }
    }

    if (edit) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [edit])

  const handleIncrease = () => setQuantity((prev) => prev + 1)
  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, parseInt(e.target.value) || 1)
    setQuantity(value)
  }

  if (loading) return <p>Loading...</p>
  if (!product) return notFound()

  return (
    <div className="container mx-auto p-6 pt-20 flex flex-col md:flex-row gap-6 justify-center">
      <div className="flex justify-center">
        <Image
          src={product.images.nodes[0]?.url}
          alt={product.images.nodes[0]?.altText || product.title}
          width={400}
          height={400}
          className="rounded-lg"
        />
      </div>

      <div className="flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-4">{product.title}</h1>

          <p className="text-lg mb-6">
            {formatPrice(
              product.variants.nodes[0]?.price.amount,
              product.variants.nodes[0]?.price.currencyCode
            )}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleDecrease}
            className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            <Minus className="w-6 h-6" />
          </button>

          {edit ? (
            <input
              ref={inputRef}
              type="text"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              step={1}
              className="w-16 p-2 text-center rounded bg-gray-700"
              autoFocus
            />
          ) : (
            <p
              onClick={() => setEdit(true)}
              className="w-16 p-2 cursor-pointer rounded text-center bg-gray-700"
            >
              {quantity}
            </p>
          )}

          <button
            onClick={handleIncrease}
            className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            <Plus className="w-6 h-6" />
          </button>
          <button
            onClick={() =>
              addToCart(product.id, quantity, product.variants.nodes[0].id)
            }
            className="px-4 py-2 bg-green-900 text-white rounded-md hover:bg-green-800 min-w-40"
          >
            🛒 Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
