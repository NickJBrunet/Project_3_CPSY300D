export default function SecurityStatus() {
	return (
		<section>
			<h2 className="text-2xl font-semibold mb-4 text-gray-900">
				Security & Compliance
			</h2>

			<div className="bg-white p-4 shadow-lg rounded-lg">
				<h3 className="font-semibold text-gray-900 mb-2">
					Security Status
				</h3>

				<p className="text-sm text-gray-700">
					Encryption:{" "}
					<span className="text-yellow-600 font-semibold">
						Pending
					</span>
				</p>

				<p className="text-sm text-gray-700">
					Access Control:{" "}
					<span className="text-yellow-600 font-semibold">
						Pending
					</span>
				</p>

				<p className="text-sm text-gray-700">
					Compliance:{" "}
					<span className="text-yellow-600 font-semibold">
						GDPR Compliant pending
					</span>
				</p>
			</div>
		</section>
	)
}