import { client } from "../client/client"
import { z } from "zod"

const shopInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  primaryDomain: z.object({
    url: z.string(),
  }),
})

const shopInfoQuery = `
query getShopInfo {
  shop {
    id
    name
    description
    primaryDomain {
      url
    }
  }
}
`
export type MyShopInfo = z.infer<typeof shopInfoSchema>

export const getShopInfo = async (): Promise<MyShopInfo | null> => {
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
