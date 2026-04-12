export default function CleanupSection() {
	return (
		<section>
			<h2 className="text-2xl font-semibold mb-4 text-gray-900">
				Cloud Resource Cleanup
			</h2>

			<div className="bg-white p-4 shadow-lg rounded-lg">
				<p className="text-sm text-gray-700">
					Ensure that cloud resources are efficiently managed.
				</p>

				<button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded mt-3 transition">
					Clean Up Resources
				</button>
			</div>
		</section>
	)
}