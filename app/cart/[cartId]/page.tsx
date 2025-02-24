"use client"
import React, { useEffect, useState } from "react"

// Interfaces
interface CartItem {
  id: string
  quantity: number
  title: string
  variantId: string
  price: string
  currencyCode: string
  imageSrc: string
}

interface Cart {
  id: string
  totalQuantity: number
  checkoutUrl: string
  totalAmount: string
  currencyCode: string
  items: CartItem[]
}

import Image from "next/image"
import Link from "next/link"
import {
  createCart,
  fetchCart,
  getCartId,
  updateCartLine,
  removeCartLine,
} from "@/lib/commerce"

const Cart = () => {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCart = async () => {
      const cartId = getCartId()
      let cartData = null

      if (cartId) {
        cartData = await fetchCart(cartId)
      }

      if (!cartData) {
        cartData = await createCart()
      }

      setCart(cartData)
      setLoading(false)
    }

    loadCart()
  }, [])

  const updateQuantity = async (lineId: string, quantity: number) => {
    const updatedCart = await updateCartLine(cart?.id, lineId, quantity)

    if (updatedCart) {
      // After updating the cart line, refetch the cart to get the latest state
      const updatedCartData = await fetchCart(cart?.id || "")
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

  if (loading) return <p>Loading cart...</p>
  if (!cart) return <p>Cart not found.</p>

  return (
    <div className="p-5">
      <Link href={"/"} className="block p-5">
        Home
      </Link>
      <h2 className="text-xl">Your Cart ({cart.totalQuantity} items)</h2>
      {cart.items?.length > 0 ? (
        <div>
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="m-5 border p-2 flex items-center justify-between"
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
                    className="w-16 p-1 border rounded text-gray-500"
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
          <p>TOTAAL: E {cart.totalAmount}</p>
        </div>
      ) : (
        <p>🛒 Your cart is empty.</p>
      )}

      <a
        href={cart.checkoutUrl}
        className="inline-block mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
      >
        Go to Checkout
      </a>
    </div>
  )
}

export default Cart
