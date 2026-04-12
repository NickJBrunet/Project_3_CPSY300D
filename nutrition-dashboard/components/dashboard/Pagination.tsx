"use client"

import { useState } from "react"

export default function Pagination() {
	const [page, setPage] = useState(1)

	return (
		<section>
			<h2 className="text-2xl font-semibold mb-4 text-gray-900">
				Pagination
			</h2>

			<div className="bg-white p-4 shadow-lg rounded-lg">
				<div className="flex justify-center items-center gap-3">
					<button
						onClick={() => setPage(Math.max(1, page - 1))}
						className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition"
					>
						Previous
					</button>

					<span className="px-4 py-1 bg-blue-600 text-white rounded font-medium">
						{page}
					</span>

					<button
						onClick={() => setPage(page + 1)}
						className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition"
					>
						Next
					</button>
				</div>
			</div>
		</section>
	)
}