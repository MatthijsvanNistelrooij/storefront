import usePriceFormatter from "@/hooks/usePriceFormatter"
import { addToCart } from "@/lib/commerce/cart/addToCart"
import {
  getCollections,
  Collection,
} from "@/lib/commerce/collection/collections"
import ProductCard from "@/components/ProductCard"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRightIcon } from "lucide-react"

const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([])
  const formatPrice = usePriceFormatter()

  useEffect(() => {
    const fetchCollections = async () => {
      const data = await getCollections()
      if (data) {
        setCollections(data)
      }
    }
    fetchCollections()
  }, [])

  return (
    <div className="space-y-12 mb-40">
      {collections.length > 0 ? (
        collections.map((collection) => (
          <section key={collection.id} className="space-y-4">
            <h2 className="text-center text-2xl font-bold">
              {collection.title}
            </h2>
            <h1 className="text-center text-sm">
              <Link
                href={`/collection/${collection.handle}`}
                className="text-gray-400 hover:text-gray-200 inline-flex items-center space-x-1"
              >
                <span>{collection?.description}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {collection.products.nodes.map((product) => {
                const imageSrc = product.images.nodes[0]?.url
                const imageAlt =
                  product.images.nodes[0]?.altText || product.title
                const price = parseFloat(
                  product.variants.nodes[0]?.price?.amount
                ).toFixed(2)
                const currencyCode =
                  product.variants.nodes[0]?.price?.currencyCode
                const variantId = product.variants.nodes[0]?.id

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    handle={product.handle}
                    imageSrc={imageSrc}
                    imageAlt={imageAlt}
                    price={formatPrice(price, currencyCode)}
                    currencyCode={currencyCode}
                    variantId={variantId}
                    addToCart={addToCart}
                  />
                )
              })}
            </div>
          </section>
        ))
      ) : (
        <p className="text-center mt-20">Loading collections...</p>
      )}
    </div>
  )
}

export default Collections
