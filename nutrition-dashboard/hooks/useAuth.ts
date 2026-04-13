// // hooks/useAuth.ts
// import { useState, useEffect } from "react"
// import { getMe } from "@/lib/api"

// export function useAuth() {
// 	const [user, setUser] = useState(null)
// 	const [loading, setLoading] = useState(true)

// 	useEffect(() => {
// 		getMe()
// 			.then(setUser)
// 			.catch(() => setUser(null))
// 			.finally(() => setLoading(false))
// 	}, [])

// 	return { user, loading, setUser }
// }