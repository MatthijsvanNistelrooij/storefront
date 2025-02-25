"use client"
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react"
import { getCart } from "@/lib/commerce/cart/cart"
import { z } from "zod"
import { createCart } from "@/lib/commerce/cart/addToCart"

const CartItemSchema = z.object({
  id: z.string(),
  quantity: z.number(),

  merchandise: z.object({
    id: z.string(),
    title: z.string(),
    product: z.object({
      title: z.string(),
      handle: z.string(),
    }),
    image: z
      .object({
        url: z.string().url(),
        altText: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    priceV2: z
      .object({
        amount: z.string(),
        currencyCode: z.string(),
      })
      .optional(),
  }),
})

const CartSchema = z.object({
  id: z.string(),
  totalQuantity: z.number(),
  checkoutUrl: z.string(),
  estimatedCost: z.object({
    totalAmount: z.object({
      amount: z.string(),
      currencyCode: z.string(),
    }),
  }),
  lines: z.object({
    edges: z.array(
      z.object({
        node: CartItemSchema,
      })
    ),
  }),
})

type Cart = z.infer<typeof CartSchema>

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
  const getCartId = () => localStorage.getItem("shopifyCartId")

  useEffect(() => {
    const loadCart = async () => {
      const cartId = getCartId()
      let cartData = null

      if (cartId) {
        cartData = await getCart(cartId)
      }

      if (!cartData) {
        cartData = await createCart()
      }

      const parsedCart = CartSchema.safeParse(cartData)
      if (parsedCart.success) {
        setCart(parsedCart.data)
      } else {
        console.error("Invalid cart data", parsedCart.error)
      }
    }

    loadCart()
  }, [])

  useEffect(() => {
    if (cart) {
      setTotalQuantity(cart.totalQuantity || 0)
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
