"use client"
import React from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/context/CartContext"
import { fetchCart, removeCartLine, updateCartLine } from "@/lib/commerce"
import { Trash2, Minus, Plus } from "lucide-react"

const Cart = () => {
  const { cart, setCart } = useCart()

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (!cart || quantity < 1) return
    const updatedCart = await updateCartLine(cart.id, lineId, quantity)
    if (updatedCart) {
      const updatedCartData = await fetchCart(cart.id || "")
      setCart(updatedCartData)
    } else {
      console.error("Failed to update cart")
    }
  }

  const deleteItem = async (cartId: string, lineId: string) => {
    try {
      await removeCartLine(cartId, lineId)
      const updatedCart = await fetchCart(cartId)
      setCart(updatedCart)
    } catch (error) {
      console.error("Error removing item:", error)
    }
  }

  if (!cart) return <p>Cart not found.</p>

  return (
    <div className="p-5 flex flex-col gap-5 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold">
        Your Cart ({cart.totalQuantity} items)
      </h2>

      {cart.items?.length > 0 ? (
        <div className="flex flex-col gap-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-500 p-3 flex items-center justify-between rounded-md"
            >
              <Image
                src={item.imageSrc}
                alt={item.title}
                width={50}
                height={50}
                className="rounded"
              />
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-gray-400 text-sm">
                  € {parseFloat(item.price).toFixed(2)} {item.currencyCode}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 bg-gray-700 text-white rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <p className="w-6 text-center">{item.quantity}</p>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 bg-gray-700 text-white rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => deleteItem(cart.id, item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">🛒 Your cart is empty.</p>
      )}

      <div className="p-4 flex justify-between text-lg font-semibold">
        TOTAL <span>€{parseFloat(cart.totalAmount).toFixed(2)}</span>
      </div>

      <Link
        href={cart.checkoutUrl}
        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-center border border-gray-700"
      >
        Go to Checkout
      </Link>
    </div>
  )
}

export default Cart
