"use client"

import { useState } from "react"

export default function Filters() {
	const [search, setSearch] = useState("")
	const [diet, setDiet] = useState("all")

	return (
		<section>
			<h2 className="text-2xl font-semibold mb-4 text-gray-900">
				Filters and Data Interaction
			</h2>

			<div className="flex flex-wrap gap-4">
				<input
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search by Diet Type"
					className="p-2 border border-gray-300 rounded w-full sm:w-auto bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>

				<select
					value={diet}
					onChange={(e) => setDiet(e.target.value)}
					className="p-2 border border-gray-300 rounded w-full sm:w-auto bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					<option value="all">All Diet Types</option>
					<option value="vegan">Vegan</option>
					<option value="keto">Keto</option>
				</select>
			</div>
		</section>
	)
}