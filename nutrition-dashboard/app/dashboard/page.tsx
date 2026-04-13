"use client"

import { useEffect, useState } from "react"

import DashboardHeader from "../../components/dashboard/DashboardHeader"
import ChartsGrid from "../../components/charts/ChartsGrid"
import Filters from "../../components/dashboard/Filters"
import ApiActions from "../../components/dashboard/ApiActions"
import SecurityStatus from "../../components/dashboard/SecurityStatus"
import CleanupSection from "../../components/dashboard/CleanupSection"
import Pagination from "../../components/dashboard/Pagination"

export default function DashboardPage() {
	const [data, setData] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch(
					"https://diet-function-bpcvcubeaef0cyd8.canadacentral-01.azurewebsites.net/api/data"
				)

				const json = await res.json()
				setData(json)
			} catch (err) {
				console.error("FETCH ERROR:", err)
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [])

	return (
		<main className="bg-gray-100 min-h-screen">
			<DashboardHeader />

			<div className="container mx-auto p-6 space-y-10">
				{loading ? (
					<div className="text-center text-gray-500">Loading charts...</div>
				) : (
					<ChartsGrid data={data} />
				)}

				{/* <Filters /> */}
				{/* <ApiActions /> */}
				<SecurityStatus />
				<CleanupSection />
				{/* <Pagination /> */}
			</div>
		</main>
	)
}