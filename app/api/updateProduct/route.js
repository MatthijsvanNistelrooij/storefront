export async function PUT(req) {
  try {
    const { productId, updatedData } = await req.json();

    console.log('Received Product ID:', productId);
    console.log('Received Update Data:', updatedData);

    const accessToken = process.env.NEXT_PUBLIC_SHOPIFY_ADMIN_API_ACCESS_TOKEN;
    const shopifyStoreDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

    const url = `https://${shopifyStoreDomain}/admin/api/2023-10/products/${productId}.json`;

    // Log the request body to ensure it's being formed correctly
    const requestBody = JSON.stringify({
      product: {
        id: productId,
        title: updatedData.title || undefined,
        variants: [
          {
            price: updatedData.price || undefined,
          },
        ],
      },
    });
    console.log('Request Body:', requestBody);

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
        "Accept": "application/json", // Set the Accept header to specify JSON response
      },
      body: requestBody,
    });

    // Check if the response has a body
    const responseText = await response.text();
    console.log('Raw Response:', responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      return new Response(JSON.stringify(data), { status: 200 });
    } else {
      console.error("Error response:", responseText);
      return new Response(
        JSON.stringify({ error: "Failed to update product", details: responseText }),
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("Error updating product:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500 }
    );
  }
}
