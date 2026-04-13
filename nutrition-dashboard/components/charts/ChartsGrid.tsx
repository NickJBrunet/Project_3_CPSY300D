"use client"

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	ScatterChart,
	Scatter,
	CartesianGrid
} from "recharts"

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f"]

function ChartCard({ title, description, children }: any) {
	return (
		<div className="bg-white p-4 shadow-lg rounded-lg">
			<h3 className="font-semibold text-black">{title}</h3>
			<p className="text-sm text-gray-600">{description}</p>

			<div className="w-full h-48 mt-3">
				{children}
			</div>
		</div>
	)
}

export default function ChartsGrid({ data }: any) {
	const charts = data?.charts || {}

	return (
		<section>
			<h2 className="text-2xl font-semibold mb-4 text-black">
				Explore Nutritional Insights
			</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

				{/* BAR CHART */}
				<ChartCard
					title="Bar Chart"
					description="Average macronutrient content by diet type."
				>
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={charts.bar_chart}>
							<XAxis dataKey="Diet_type" />
							<YAxis />
							<Tooltip />
							<Bar dataKey="Protein(g)" />
							<Bar dataKey="Carbs(g)" />
							<Bar dataKey="Fat(g)" />
						</BarChart>
					</ResponsiveContainer>
				</ChartCard>

				{/* PIE CHART */}
				<ChartCard
					title="Pie Chart"
					description="Recipe distribution by diet type."
				>
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={charts.pie_chart}
								dataKey="count"
								nameKey="Diet_type"
								cx="50%"
								cy="50%"
								outerRadius={60}
							>
								{charts.pie_chart?.map((_: any, i: number) => (
									<Cell key={i} fill={COLORS[i % COLORS.length]} />
								))}
							</Pie>
							<Tooltip />
						</PieChart>
					</ResponsiveContainer>
				</ChartCard>

				{/* SCATTER */}
				<ChartCard
					title="Scatter Plot"
					description="Protein vs Carbs relationship."
				>
					<ResponsiveContainer width="100%" height="100%">
						<ScatterChart>
							<CartesianGrid />
							<XAxis dataKey="Protein(g)" name="Protein" />
							<YAxis dataKey="Carbs(g)" name="Carbs" />
							<Tooltip />
							<Scatter data={charts.scatter_chart} />
						</ScatterChart>
					</ResponsiveContainer>
				</ChartCard>

				{/* HEATMAP */}
				<ChartCard
					title="Heatmap"
					description="Macronutrient intensity."
				>
					<div className="grid grid-cols-3 gap-1 h-full text-xs">
						{charts.heatmap?.values?.map((row: number[], i: number) =>
							row.map((val: number, j: number) => (
								<div
									key={`${i}-${j}`}
									className="flex items-center justify-center text-white"
									style={{
										backgroundColor: `rgba(99,102,241,${val / 100})`
									}}
								>
									{val}
								</div>
							))
						)}
					</div>
				</ChartCard>

			</div>
		</section>
	)
}