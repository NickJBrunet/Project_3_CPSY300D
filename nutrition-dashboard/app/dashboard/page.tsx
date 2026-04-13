"use client"

import DashboardHeader from "../../components/dashboard/DashboardHeader"
import ChartsGrid from "../../components/charts/ChartsGrid"
import Filters from "../../components/dashboard/Filters"
import ApiActions from "../../components/dashboard/ApiActions"
import SecurityStatus from "../../components/dashboard/SecurityStatus"
import CleanupSection from "../../components/dashboard/CleanupSection"
import Pagination from "../../components/dashboard/Pagination"
export default function DashboardPage() {
	return (
		<main className="bg-gray-100 min-h-screen">
			<DashboardHeader />

			<div className="container mx-auto p-6 space-y-10">
				<ChartsGrid />
				<Filters />
				<ApiActions />
				<SecurityStatus />
				<CleanupSection />
				<Pagination />
			</div>
		</main>
	)
}