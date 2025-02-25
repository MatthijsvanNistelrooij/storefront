import usePriceFormatter from "@/hooks/usePriceFormatter"
import { addToCart } from "@/lib/commerce/cart/addToCart"
import { getProducts, Product } from "@/lib/commerce/product/products"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([])
  const formatPrice = usePriceFormatter()

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts(10)
      setProducts(data)
    }

    fetchProducts()
  }, [])

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {products.length > 0 ? (
          products.map((product) => {
            const imageSrc = product.images.nodes[0]?.url
            const imageAlt = product.images.nodes[0]?.altText || product.title
            const price = parseFloat(
              product.variants.nodes[0]?.price?.amount
            ).toFixed(2)
            const currencyCode = product.variants.nodes[0]?.price?.currencyCode
            const variantId = product.variants.nodes[0]?.id

            return (
              <div
                key={product.id}
                className="border border-gray-500 rounded-lg shadow-lg p-6 flex flex-col items-center hover:bg-gray-900"
              >
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  width={100}
                  height={100}
                  className="rounded-md"
                  priority
                />
                <h2 className="text-xl font-semibold mt-4">{product.title}</h2>
                <p className="text-gray-600">
                  {formatPrice(price, currencyCode)}
                </p>
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => addToCart(product.id, 1, variantId)}
                    className="px-4 py-2 bg-green-900 text-white rounded-md hover:bg-green-800"
                  >
                    🛒 Add to Cart
                  </button>
                  <Link
                    href={`/product/${product.handle}`}
                    className="px-4 py-2 mb-8 bg-blue-900 text-white rounded-md hover:bg-blue-800"
                  >
                    🔍 View Details
                  </Link>
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-center mt-20">Loading products...</p>
        )}
      </div>
    </div>
  )
}

export default ProductList
