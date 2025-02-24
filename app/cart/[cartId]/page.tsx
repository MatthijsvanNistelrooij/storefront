"use client"
import React from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/context/CartContext"
import { fetchCart, removeCartLine, updateCartLine } from "@/lib/commerce"

const Cart = () => {
  const { cart, setCart } = useCart()

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (!cart) return
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
    <div className="p-10 flex flex-col gap-5">
      <h2 className="text-xl">Your Cart ({cart.totalQuantity} items)</h2>
      {cart.items?.length > 0 ? (
        <div>
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-500 p-2 flex items-center justify-between mb-4"
            >
              <Image
                src={item.imageSrc}
                alt={item.title}
                width={50}
                height={50}
              />
              <div className="ml-4">
                <p>{item.title}</p>
                <p>
                  {item.price} {item.currencyCode}
                </p>
                <div className="flex items-center gap-2">
                  <p>Quantity: </p>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value))
                    }
                    className="w-16 p-1 border rounded bg-gray-800"
                  />
                </div>
              </div>
              <button
                onClick={() => deleteItem(cart.id, item.id)}
                className="text-red-500 hover:text-red-700 mt-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>🛒 Your cart is empty.</p>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex p-4 justify-end">
          TOTAAL <span className="mx-2">€</span> {cart.totalAmount}
        </div>

        <Link
          href={cart.checkoutUrl}
          className="block mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-center"
        >
          Go to Checkout
        </Link>
      </div>
    </div>
  )
}

export default Cart
