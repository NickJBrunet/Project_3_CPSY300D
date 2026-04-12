export default function OAuthSection() {
	return (
		<section>
			<h2 className="text-2xl font-semibold mb-4 text-gray-900">
				OAuth & 2FA Integration
			</h2>

			<div className="bg-white p-4 shadow-lg rounded-lg">
				<h3 className="font-semibold text-gray-900 mb-3">
					Secure Login
				</h3>

				<div className="flex flex-col gap-3">
					<button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition">
						Login with Google
					</button>

					<button className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded transition">
						Login with GitHub
					</button>
				</div>

				<div className="mt-4">
					<label className="block text-sm text-gray-700 mb-1">
						Enter 2FA Code
					</label>

					<input
						type="text"
						className="p-2 border border-gray-300 rounded w-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Enter your 2FA code"
					/>
				</div>
			</div>
		</section>
	)
}