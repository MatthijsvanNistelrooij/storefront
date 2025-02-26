"use client"
import React, { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/context/CartContext"
import { Trash2, Minus, Plus } from "lucide-react"
import slugify from "slugify"
import { getCart } from "@/lib/commerce/cart/cart"
import { updateCartLine } from "@/lib/commerce/cart/updateCartLine"
import { removeCartLine } from "@/lib/commerce/cart/removeCartLine"
import usePriceFormatter from "@/hooks/usePriceFormatter"

const Cart = () => {
  const formatPrice = usePriceFormatter()
  const { cart, setCart } = useCart()

  useEffect(() => {
    if (!cart?.id) return

    const fetchUpdatedCart = async () => {
      const updatedCart = await getCart(cart.id || "")
      setCart(updatedCart)
    }

    fetchUpdatedCart()
  }, [cart?.id, setCart])

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (!cart || quantity < 1) return
    const updatedCart = await updateCartLine(cart.id, lineId, quantity)
    if (updatedCart) {
      const updatedCartData = await getCart(cart.id || "")
      setCart(updatedCartData)
    }
  }

  const deleteItem = async (cartId: string, lineId: string) => {
    try {
      await removeCartLine(cartId, lineId)
      const updatedCart = await getCart(cartId)
      setCart(updatedCart)
    } catch (error) {
      console.error("Error removing item:", error)
    }
  }

  if (!cart) return <p className="text-center mt-20">Loading cart...</p>

  const totalPrice = formatPrice(
    cart?.estimatedCost?.totalAmount?.amount,
    cart?.estimatedCost?.totalAmount?.currencyCode
  )

  return (
    <div className="p-5 flex flex-col gap-5 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold">
        Your Cart ({cart.totalQuantity} items)
      </h2>

      {cart?.lines?.edges.length > 0 ? (
        <div className="flex flex-col gap-2">
          {cart.lines.edges.map(({ node }) => {
            const {
              id: lineId,
              quantity,
              merchandise: {
                product: { title, handle },
                priceV2,
                image,
              },
            } = node

            const productSlug = slugify(handle, { lower: true, strict: true })
            const productImage = image?.url || "/placeholder.jpg"
            const formattedPrice = formatPrice(
              priceV2?.amount,
              priceV2?.currencyCode
            )

            return (
              <div
                key={lineId}
                className="border border-gray-500 p-3 flex items-center justify-between rounded-md"
              >
                <Link href={`/product/${productSlug}`}>
                  <Image
                    src={productImage}
                    alt={title}
                    width={70}
                    height={70}
                    className="rounded"
                  />
                </Link>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-gray-400 text-sm">{formattedPrice}</p>
                  <div className="flex items-center gap-2 mt-2 justify-between">
                    <div className="flex">
                      <button
                        onClick={() => updateQuantity(lineId, quantity - 1)}
                        className="p-1 bg-gray-700 text-white rounded hover:bg-gray-800"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <p className="px-2 min-w-10 text-center">{quantity}</p>
                      <button
                        onClick={() => updateQuantity(lineId, quantity + 1)}
                        className="p-1 bg-gray-700 text-white rounded hover:bg-gray-800"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => deleteItem(cart.id, lineId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <>
          <p className="text-center text-gray-500 mt-20">
            🛒 Your cart is empty.
          </p>
          <Link
            href={"/"}
            className="text-center border border-gray-700 p-2 hover:bg-gray-800 mt-20"
          >
            Continue shopping
          </Link>
        </>
      )}

      {cart?.lines?.edges.length > 0 && (
        <>
          <div className="p-4 flex justify-between text-lg font-semibold">
            TOTAL <span>{totalPrice}</span>
          </div>
          <Link
            href={cart.checkoutUrl}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-center border border-gray-700"
          >
            Go to Checkout
          </Link>
        </>
      )}
    </div>
  )
}

export default Cart
