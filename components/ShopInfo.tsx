import { getShopInfo, MyShopInfo } from "@/lib/commerce/shop/shop"
import Link from "next/link"
import React, { useEffect, useState } from "react"

const ShopInfo = () => {
  const [shopInfo, setShopInfo] = useState<MyShopInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchShopInfo = async () => {
      const data = await getShopInfo()
      setShopInfo(data)
      setLoading(false)
    }

    fetchShopInfo()
  }, [])

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>
  }

  if (!shopInfo) {
    return <div className="text-center mt-20">Failed to load shop info</div>
  }

  return (
    <div className="flex flex-col items-center text-center h-32">
      <h1 className="text-4xl font-bold">{shopInfo.name}</h1>
      {shopInfo.description && (
        <p className="mt-4 text-lg text-gray-600">{shopInfo.description}</p>
      )}
      <Link
        target="_blank"
        rel="noreferrer"
        href={shopInfo.primaryDomain.url || ""}
        className="mt-2 text-blue-500 hover:text-blue-300"
      >
        Visit our shop
      </Link>
    </div>
  )
}

export default ShopInfo
