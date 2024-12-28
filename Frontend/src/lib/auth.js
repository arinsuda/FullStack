import { useAuthStore } from "../stores/authStore"
import { jwtDecode } from "jwt-decode"

async function Login(url, obj, setErrorMessage) {
  const authStore = useAuthStore()

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: obj.username,
      password: obj.password,
    }),
  })

  if (response.status === 201) {
    const data = await response.json()
    console.log(data)
    const token = data.data.token.token
    const payload = jwtDecode(token)
    authStore.setTokens({ token, payload })
    return response
  } else {
    const errorData = await response.json()
    const errorMessage =
      errorData[0]?.message || "Username and Password incorrect."
    setErrorMessage(errorMessage)
    throw new Error(errorMessage)
  }
}

async function Register(url, obj) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });

    if (response.status === 201) {
      return await response.json();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Registration failed. Please try again.");
    }
  } catch (error) {
    console.error("Registration error:", error);
    throw error
  }
}

export default { 
  Login,
  Register
}
