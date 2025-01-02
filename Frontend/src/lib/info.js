import { useRouter } from 'vue-router';

async function fetchCategories(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    const data = await response.json();
    return data.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
}

async function getData(url) {
  const token = JSON.parse(localStorage.getItem("token"));
  if (!token) {
    alert("No token found. Please log in.");
    useRouter().push({ name: "Login" });
    throw new Error("Unauthorized: No token available.");
  }
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      return await response.json();
    } else if (response.status === 401) {
      alert("Your session has expired. Please log in again.");
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiration");
      localStorage.removeItem("payload");
      useRouter().push({ name: "Login" });
      throw new Error("Unauthorized: Token has expired or is invalid.");
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function edituser(url, formData) {
  const token = JSON.parse(localStorage.getItem("token"));
  if (!token) {
    useRouter().push({ name: "Login" });
    throw new Error("Unauthorized: No token available.");
  }

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.status === 200) {
      return await response.json();
    } else {
      const errorResponse = await response.json();
      console.error("API error response:", errorResponse);
      throw new Error(`Failed to update user: ${errorResponse.message}`);
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export { fetchCategories, getData, edituser };
