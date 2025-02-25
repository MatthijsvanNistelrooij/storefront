import { addToCart } from "@/lib/commerce/cart/addToCart"
import { getProducts, Product } from "@/lib/commerce/product/products"
import { useEffect, useState } from "react"
import ProductCard from "./ProductCard"

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([])

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
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                handle={product.handle}
                imageSrc={imageSrc}
                imageAlt={imageAlt}
                price={price}
                currencyCode={currencyCode}
                variantId={variantId}
                addToCart={addToCart}
              />
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
