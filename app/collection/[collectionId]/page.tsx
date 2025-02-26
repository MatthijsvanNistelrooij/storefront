"use client"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import usePriceFormatter from "@/hooks/usePriceFormatter"
import { Collection, getCollection } from "@/lib/commerce/collection/collection"
import ProductCard from "@/components/ProductCard"
import { addToCart } from "@/lib/commerce/cart/addToCart"

const CollectionDetails = () => {
  const { collectionId } = useParams()
  const collectionSlug = Array.isArray(collectionId)
    ? collectionId[0]
    : collectionId
  const [collection, setCollection] = useState<Collection | null>(null)

  const formatPrice = usePriceFormatter()

  useEffect(() => {
    if (!collectionSlug) return

    const fetchCollection = async () => {
      const data = await getCollection(collectionSlug)
      if (data) setCollection(data)
    }

    fetchCollection()
  }, [collectionSlug])

  if (!collection) {
    return <p className="text-center mt-20">Loading collection...</p>
  }

  const { title, description, products } = collection

  return (
    <div className="max-w-6xl mx-auto p-4 mt-10">
      <h1 className="text-3xl font-bold mb-2 text-center">{title}</h1>
      <p className="text-gray-500 text-center mb-6">{description}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.nodes.map((product) => {
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
              price={formatPrice(price, currencyCode)}
              currencyCode={currencyCode}
              variantId={variantId}
              addToCart={addToCart}
            />
          )
        })}
      </div>
    </div>
  )
}

export default CollectionDetails
