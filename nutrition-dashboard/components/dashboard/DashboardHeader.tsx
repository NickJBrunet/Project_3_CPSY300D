"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardHeader() {
	const { user, loading, logout } = useAuth();
	const router = useRouter();

	const handleLogout = async () => {
		await logout();
		router.push("/");
	};

	const displayName = user?.displayName || user?.email || "User";

	return (
		<header className="bg-blue-600 p-4 text-white flex justify-between items-center">
			<h1 className="text-3xl font-semibold">Nutritional Insights</h1>

			<div className="flex items-center gap-4">
				<span className="font-medium">{loading ? "Loading..." : displayName}</span>
				<button
					onClick={handleLogout}
					className="bg-red-500 px-3 py-1 rounded text-sm font-medium hover:bg-red-600 transition">
					Logout
				</button>
			</div>
		</header>
	);
}