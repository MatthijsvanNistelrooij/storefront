"use client"
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react"
import { fetchCart, getCartId, createCart } from "@/lib/commerce"

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

interface CartContextProps {
  cart: Cart | null
  totalQuantity: number
  setCart: React.Dispatch<React.SetStateAction<Cart | null>>
}

interface CartProviderProps {
  children: ReactNode
}

const CartContext = createContext<CartContextProps | undefined>(undefined)

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<Cart | null>(null)
  const [totalQuantity, setTotalQuantity] = useState<number>(0)

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
    }

    loadCart()
  }, [])

  useEffect(() => {
    if (cart) {
      setTotalQuantity(cart.totalQuantity)
    }
  }, [cart])

  return (
    <CartContext.Provider value={{ cart, totalQuantity, setCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = (): CartContextProps => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
