"use client"
import ProductList from "@/components/ProductList"
import ShopInfo from "@/components/ShopInfo"

const Home = () => {
  return (
    <div className="max-w-6xl mx-auto p-4 h-screen">
      <ShopInfo />
      <ProductList />
    </div>
  )
}

export default Home
