"use client"
import { useCart } from "@/context/CartContext"
import Link from "next/link"

const Navbar = () => {
  const { totalQuantity, cart } = useCart()

  const extractedCartId = cart?.id?.split("/").pop()

  return (
    <div className="flex justify-between items-center p-4 bg-gray-900 text-gray-200 sticky top-0 border-b border-gray-700 shadow-lg">
      <div className="flex gap-4">
        <Link
          href={"/"}
          className="px-4 py-2 rounded-md border border-gray-700 hover:bg-gray-800 transition-all"
        >
          Home
        </Link>
        <Link
          href={"/collections"}
          className="px-4 py-2 rounded-md border border-gray-700 hover:bg-gray-800 transition-all"
        >
          Collections
        </Link>
      </div>

      <Link
        href={`/cart/${extractedCartId}`}
        className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-700 hover:bg-gray-800 transition-all"
      >
        🛒 <span>({totalQuantity})</span>
      </Link>
    </div>
  )
}

export default Navbar
