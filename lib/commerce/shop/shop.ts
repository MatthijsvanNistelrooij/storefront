import { client } from "../client/client"
import { z } from "zod"

const shopInfoSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  url: z.string(),
  moneyFormat: z.string(),
})

const shopInfoQuery = `
  query getShopInfo {
    shop {
      name
      description
      primaryDomain {
        url
      }
      moneyFormat
    }
  }
`

export type ShopInfo = z.infer<typeof shopInfoSchema>

export const getShopInfo = async (): Promise<ShopInfo | null> => {
  try {
    const response = await client.fetch(shopInfoQuery)

    if (!response.ok) {
      console.error("Failed to fetch shop info", response.status)
      return null
    }

    const { data } = await response.json()

    const shopData = {
      ...data.shop,
      url: data.shop.primaryDomain.url,
    }

    const parsedData = shopInfoSchema.safeParse(shopData)

    if (!parsedData.success) {
      console.error("Shop info validation failed", parsedData.error)
      return null
    }

    return parsedData.data
  } catch (error) {
    console.error("Error fetching shop info:", error)
    return null
  }
}
