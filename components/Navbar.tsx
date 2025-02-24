"use client"
import { useCart } from "@/context/CartContext"
import Link from "next/link"
import React, { useEffect, useState } from "react"

const Navbar = () => {
  const { totalQuantity } = useCart()
  const [cartId, setCartId] = useState<string | null>(null)

  useEffect(() => {
    const storedCartId = localStorage.getItem("shopifyCartId")
    setCartId(storedCartId)
  }, [])

  const extractedCartId = cartId?.split("/").pop()

  return (
    <div className="flex justify-between p-5 bg-slate-700">
      <Link href={"/"} className="block border p-2">
        Home
      </Link>
      <Link
        href={`/cart/${extractedCartId}`}
        className="block border p-2 text-white"
      >
        🛒 ({totalQuantity})
      </Link>
    </div>
  )
}

export default Navbar
