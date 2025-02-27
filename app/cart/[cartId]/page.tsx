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

  const cartItems = cart?.lines?.edges.map(({ node }) => {
    const {
      id: lineId,
      quantity,
      merchandise: {
        product: { title, handle },
        priceV2,
        image,
      },
    } = node

    const productSlug = slugify(handle, {
      lower: true,
      strict: true,
    })
    const productImage = image?.url || "/placeholder.jpg"
    const formattedPrice = formatPrice(priceV2?.amount, priceV2?.currencyCode)

    return {
      lineId,
      quantity,
      title,
      productSlug,
      productImage,
      formattedPrice,
    }
  })

  return (
    <div className="max-w-5xl mx-auto p-4 h-full mt-10">
      <h2 className="text-2xl font-semibold mb-4">
        🛒 Your Cart ({cart.totalQuantity} items)
      </h2>
      <div className="flex flex-col md:flex-row gap-5 w-full">
        <div className="flex-1">
          {cart?.lines?.edges.length > 0 ? (
            <div className="flex flex-col gap-4">
              {cartItems.map(
                ({
                  lineId,
                  quantity,
                  title,
                  productSlug,
                  productImage,
                  formattedPrice,
                }) => (
                  <div
                    key={lineId}
                    className="border border-gray-500 p-4 flex items-center justify-between rounded-md"
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
                      <div className="flex items-center gap-2 mt-3 justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(lineId, quantity - 1)}
                            className="p-1 bg-gray-700 text-white rounded hover:bg-gray-800"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <p className="px-2 min-w-6 text-center">{quantity}</p>
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
              )}
            </div>
          ) : (
            <>
              <p className="text-center text-gray-500 mt-20">
                🛒 Your cart is empty.
              </p>
              <div className="flex justify-center">
                <Link
                  href={"/"}
                  className="inline-block justify-center text-center w-56 border border-gray-700 p-2 hover:bg-gray-800 mt-10"
                >
                  Continue shopping
                </Link>
              </div>
            </>
          )}
        </div>
        {cart.totalQuantity > 0 && (
          <div className="min-w-[300px] p-5 border border-gray-500 rounded-md shadow-lg h-[380px] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Summary</h3>
            <div className="flex justify-between text-lg font-light mb-2">
              <p className="text-sm font-light">
                Products ({cart.totalQuantity})
              </p>
              <p className="text-sm font-light">{totalPrice}</p>
            </div>
            <div className="flex justify-between text-lg font-medium mb-2">
              <p className="text-sm font-light">Shipping</p>
              <p className="text-sm font-light">EUR 0.00</p>
            </div>
            <div className="border-t border-gray-300 my-4" />
            <div className="flex justify-between text-xl font-semibold p-2">
              <span>Total</span>
              <span>{totalPrice}</span>
            </div>

            <Link
              href={cart.checkoutUrl}
              className="mt-28 block w-full border border-gray-700 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-center"
            >
              Go to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
