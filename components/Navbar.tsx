"use client"
import { useCart } from "@/context/CartContext"
import Link from "next/link"

const Navbar = () => {
  const { totalQuantity, cart } = useCart()

  const extractedCartId = cart?.id?.split("/").pop()

  return (
    <div className="flex justify-between p-5 bg-gray-800 sticky top-0">
      <div className="flex gap-2">
        <Link
          href={"/"}
          className="block border rounded border-slate-400 p-2 hover:border-slate-100"
        >
          Home <span className="text-xs text-gray-400">v2.2</span>
        </Link>
        <Link
          href={"/collections"}
          className="block border rounded border-slate-400 p-2 hover:border-slate-100"
        >
          Collections
        </Link>
      </div>

      <Link
        href={`/cart/${extractedCartId}`}
        className="block border rounded border-slate-400 p-2 text-white hover:border-slate-100"
      >
        🛒 ({totalQuantity})
      </Link>
    </div>
  )
}

export default Navbar
