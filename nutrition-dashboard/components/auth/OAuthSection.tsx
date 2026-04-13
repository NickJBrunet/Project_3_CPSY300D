"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
	GithubAuthProvider,
} from "firebase/auth";
import { auth } from "../../lib/firebaseClient";

const authProviders = {
	google: new GoogleAuthProvider(),
	github: new GithubAuthProvider(),
};

const apiBase = process.env.NEXT_PUBLIC_AUTH_API_URL ?? "http://localhost:7071/api";

const syncUserProfile = async (payload: {
	uid: string;
	email: string;
	phoneNumber: string;
	provider: string;
}) => {
	const response = await fetch(`${apiBase}/auth/profile`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(errorText || "Failed to sync user profile.");
	}
};


type AuthMode = "signin" | "signup";

export default function OAuthSection() {
	const [mode, setMode] = useState<AuthMode>("signin");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [infoMessage, setInfoMessage] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (auth.currentUser) {
			router.push("/dashboard");
		}
	}, [router]);

	const resetState = () => {
		setInfoMessage(null);
		setErrorMessage(null);
	};

	const handleEmailSignup = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrorMessage(null);
		if (!email || !password) {
			setErrorMessage("Email and password are required for sign up.");
			return;
		}

		setIsLoading(true);
		try {
			const result = await createUserWithEmailAndPassword(auth, email, password);
			await syncUserProfile({
				uid: result.user.uid,
				email: result.user.email || email,
				phoneNumber: "",
				provider: "email",
			});
			router.push("/dashboard");
		} catch (error: any) {
			setErrorMessage(error?.message || "Unable to create account.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleEmailSignin = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrorMessage(null);
		if (!email || !password) {
			setErrorMessage("Email and password are required.");
			return;
		}

		setIsLoading(true);
		try {
			const result = await signInWithEmailAndPassword(auth, email, password);
			await syncUserProfile({
				uid: result.user.uid,
				email: result.user.email || email,
				phoneNumber: "",
				provider: "email",
			});
			router.push("/dashboard");
		} catch (error: any) {
			setErrorMessage(error?.message || "Unable to sign in.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleOAuthLogin = async (providerName: keyof typeof authProviders) => {
		setErrorMessage(null);
		setIsLoading(true);
		try {
			const provider = authProviders[providerName];
			const response = await signInWithPopup(auth, provider);
			await syncUserProfile({
				uid: response.user.uid,
				email: response.user.email || "",
				phoneNumber: "",
				provider: providerName,
			});
			router.push("/dashboard");
		} catch (error: any) {
			setErrorMessage(error?.message || `Unable to sign in with ${providerName}.`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<section>
			<h2 className="text-2xl font-semibold mb-4 text-gray-900">OAuth + Email/PW Auth</h2>

			<div className="bg-white p-6 shadow-lg rounded-lg space-y-6">
				<div className="flex flex-wrap items-center gap-3">
					<button
						type="button"
						className={`rounded-md px-4 py-2 ${mode === "signin" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
						onClick={() => {
						resetState();
						setMode("signin");
					}}>
						Sign In
					</button>
					<button
						type="button"
						className={`rounded-md px-4 py-2 ${mode === "signup" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
						onClick={() => {
						resetState();
						setMode("signup");
					}}>
						Sign Up
					</button>
				</div>

				{errorMessage ? (
					<div className="rounded-md bg-red-50 border border-red-200 p-3 text-red-700">
						{errorMessage}
					</div>
				) : null}

				{infoMessage ? (
					<div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-blue-900">
						{infoMessage}
					</div>
				) : null}

				<form onSubmit={mode === "signup" ? handleEmailSignup : handleEmailSignin} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">Email</label>
							<input
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								placeholder="you@example.com"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">Password</label>
							<input
								type="password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								placeholder="Enter a secure password"
							/>
						</div>



						<button
							type="submit"
							disabled={isLoading}
							className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
							{mode === "signup" ? "Create account" : "Sign in"}
						</button>
					</form>

				<div className="border-t border-gray-200 pt-5">
					<p className="text-sm font-medium text-gray-800 mb-3">Continue with</p>
					<div className="flex flex-col gap-3 sm:flex-row">
						<button
							type="button"
							onClick={() => handleOAuthLogin("google")}
							className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
							Sign in with Google
						</button>
						<button
							type="button"
							onClick={() => handleOAuthLogin("github")}
							className="w-full rounded-md bg-gray-800 px-4 py-2 text-white hover:bg-gray-900 disabled:opacity-50">
							Sign in with GitHub
						</button>
					</div>
				</div>
			</div>

		</section>
	);
}
