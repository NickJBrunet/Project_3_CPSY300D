function ChartCard({ title, description }: any) {
	return (
		<div className="bg-white p-4 shadow-lg rounded-lg">
			<h3 className="font-semibold text-black">{title}</h3>
			<p className="text-sm text-gray-600">{description}</p>

			{/* Placeholder chart box */}
			<div className="w-full h-48 bg-gray-200 mt-3 flex items-center justify-center text-gray-500">
				Chart Placeholder
			</div>
		</div>
	)
}

export default function ChartsGrid() {
	return (
		<section>
			<h2 className="text-2xl font-semibold mb-4">
				Explore Nutritional Insights
			</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<ChartCard
					title="Bar Chart"
					description="Average macronutrient content by diet type."
				/>
				<ChartCard
					title="Scatter Plot"
					description="Nutrient relationships (e.g., protein vs carbs)."
				/>
				<ChartCard
					title="Heatmap"
					description="Nutrient correlations."
				/>
				<ChartCard
					title="Pie Chart"
					description="Recipe distribution by diet type."
				/>
			</div>
		</section>
	)
}