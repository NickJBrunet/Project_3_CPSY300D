export default function ApiActions() {
	return (
		<section>
			<h2 className="text-2xl font-semibold mb-4 text-gray-900">
				API Data Interaction
			</h2>

			<div className="bg-white p-4 shadow-lg rounded-lg">
				<div className="flex flex-wrap gap-4">
					<button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition">
						Get Nutritional Insights
					</button>

					<button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition">
						Get Recipes
					</button>

					<button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition">
						Get Clusters
					</button>
				</div>
			</div>
		</section>
	)
}