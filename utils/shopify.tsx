export const updateProduct = async (productId, updatedData) => {
  try {
    const response = await fetch('/api/updateProduct', {
      method: 'PUT', // Ensure this is PUT
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, updatedData }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Product updated:', data);
    } else {
      console.error('Failed to update product:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
