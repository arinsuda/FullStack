async function fetchCategories(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
    })

    if (response.status === 200) {
      return await response.json()
    }
  } catch (error) {
    console.error("Error fetching categories:", error)
    throw error
  }
}

async function getData(url) {
  const token = JSON.parse(localStorage.getItem("token"))
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.status === 200) {
      return await response.json()
    } else if (response.status === 401) {
      alert("Your session has expired. Please log in again.")
      localStorage.removeItem("token")
      localStorage.removeItem("tokenExpiration")
      localStorage.removeItem("payload")
      router.push({ name: "Login" })
      throw new Error("Unauthorized: Token has expired or is invalid.")
    }
  } catch (error) {
    console.error("Error in Fetch Likes:", error)
    throw error
  }
}

export { fetchCategories, getData }
