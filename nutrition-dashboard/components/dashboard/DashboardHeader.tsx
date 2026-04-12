export default function DashboardHeader() {
	return (
		<header className="bg-blue-600 p-4 text-white flex justify-between">
			<h1 className="text-3xl font-semibold">Nutritional Insights</h1>

			<div className="flex items-center gap-4">
				<span className="font-medium">John Doe</span>
				<button className="bg-red-500 px-3 py-1 rounded">
					Logout
				</button>
			</div>
		</header>
	)
}