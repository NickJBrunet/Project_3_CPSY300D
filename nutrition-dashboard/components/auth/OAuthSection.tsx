"use client";

import { useEffect, useState } from "react";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	GoogleAuthProvider,
	GithubAuthProvider,
	RecaptchaVerifier,
	PhoneAuthProvider,
	linkWithCredential,
	reauthenticateWithCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebaseClient";

const authProviders = {
	google: new GoogleAuthProvider(),
	github: new GithubAuthProvider(),
};

type AuthMode = "signin" | "signup";
type FlowStage = "auth" | "phone" | "otp" | "success";

export default function OAuthSection() {
	const [mode, setMode] = useState<AuthMode>("signin");
	const [stage, setStage] = useState<FlowStage>("auth");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [phone, setPhone] = useState("");
	const [verificationCode, setVerificationCode] = useState("");
	const [verificationId, setVerificationId] = useState<string | null>(null);
	const [pendingPhone, setPendingPhone] = useState("");
	const [infoMessage, setInfoMessage] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isNewUser, setIsNewUser] = useState(false);

	useEffect(() => {
		return () => {
			const recaptcha = (window as any).firebaseRecaptchaVerifier;
			if (recaptcha?.clear) {
				recaptcha.clear();
			}
		};
	}, []);

	const resetState = () => {
		setStage("auth");
		setVerificationId(null);
		setPendingPhone("");
		setVerificationCode("");
		setInfoMessage(null);
		setErrorMessage(null);
	};

	const ensureRecaptcha = async () => {
		if (typeof window === "undefined") {
			throw new Error("ReCAPTCHA must run in the browser.");
		}

		let verifier = (window as any).firebaseRecaptchaVerifier as RecaptchaVerifier | undefined;
		if (!verifier) {
			verifier = new RecaptchaVerifier(
				auth,
				"recaptcha-container",
				{
					size: "invisible",
					callback: () => {
						return true;
					},
				}
			);
			verifier.render().catch(() => null);
			(window as any).firebaseRecaptchaVerifier = verifier;
		}

		return verifier;
	};

	const loadStoredPhone = async (uid: string) => {
		const snapshot = await getDoc(doc(firestore, "users", uid));
		return snapshot.exists() ? snapshot.data()?.phoneNumber || "" : "";
	};

	const savePhoneForUser = async (uid: string, phoneNumber: string) => {
		const currentEmail = auth.currentUser?.email || email;
		await setDoc(
			doc(firestore, "users", uid),
			{
				email: currentEmail,
				phoneNumber,
				updatedAt: new Date().toISOString(),
			},
			{ merge: true }
		);
	};

	const sendPhoneVerification = async (phoneNumber: string) => {
		setErrorMessage(null);
		setInfoMessage(`Sending SMS to ${phoneNumber}...`);
		const verifier = await ensureRecaptcha();
		const provider = new PhoneAuthProvider(auth);
		const verificationId = await provider.verifyPhoneNumber(phoneNumber, verifier);
		setVerificationId(verificationId);
		setStage("otp");
		setInfoMessage(`SMS verification code sent to ${phoneNumber}.`);
	};

	const handleEmailSignup = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrorMessage(null);
		if (!email || !password || !phone) {
			setErrorMessage("Email, password, and phone number are required for sign up.");
			return;
		}

		setIsLoading(true);
		try {
			const result = await createUserWithEmailAndPassword(auth, email, password);
			setIsNewUser(true);
			setPendingPhone(phone);
			await sendPhoneVerification(phone);
			setInfoMessage("Enter the SMS code to finish sign up and complete 2FA.");
		} catch (error: any) {
			setErrorMessage(error?.message || "Unable to create account.");
		} finally {
			setIsLoading(false);
		}
	};

	const beginSecondFactor = async (uid: string, storedPhone: string) => {
		const phoneValue = storedPhone || phone;
		if (!phoneValue) {
			setStage("phone");
			setInfoMessage("Please enter your phone number for 2FA.");
			setIsNewUser(!storedPhone);
			return;
		}

		setPendingPhone(phoneValue);
		setIsNewUser(!storedPhone);
		await sendPhoneVerification(phoneValue);
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
			const storedPhone = await loadStoredPhone(result.user.uid);
			await beginSecondFactor(result.user.uid, storedPhone);
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
			const storedPhone = await loadStoredPhone(response.user.uid);
			await beginSecondFactor(response.user.uid, storedPhone);
		} catch (error: any) {
			setErrorMessage(error?.message || `Unable to sign in with ${providerName}.`);
		} finally {
			setIsLoading(false);
		}
	};

	const handlePhoneSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrorMessage(null);
		if (!phone) {
			setErrorMessage("Please enter a phone number.");
			return;
		}

		setPendingPhone(phone);
		setIsLoading(true);
		try {
			await sendPhoneVerification(phone);
		} catch (error: any) {
			setErrorMessage(error?.message || "Unable to send SMS verification.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrorMessage(null);
		if (!verificationId || !verificationCode) {
			setErrorMessage("Enter the verification code sent to your phone.");
			return;
		}

		setIsLoading(true);
		try {
			const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
			const currentUser = auth.currentUser;
			if (!currentUser) {
				throw new Error("No authenticated user available for 2FA.");
			}

			if (currentUser.phoneNumber) {
				await reauthenticateWithCredential(currentUser, credential);
			} else if (isNewUser) {
				await linkWithCredential(currentUser, credential);
			} else {
				await reauthenticateWithCredential(currentUser, credential);
			}

			await savePhoneForUser(currentUser.uid, pendingPhone);
			setStage("success");
			setInfoMessage("Phone verification complete. You are signed in.");
		} catch (error: any) {
			setErrorMessage(error?.message || "Unable to verify the code.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<section>
			<h2 className="text-2xl font-semibold mb-4 text-gray-900">OAuth + Email Auth with Phone 2FA</h2>

			<div className="bg-white p-6 shadow-lg rounded-lg space-y-6">
				<div className="flex flex-wrap items-center gap-3">
					<button
						type="button"
						className={`rounded-md px-4 py-2 ${mode === "signin" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
						onClick={() => {
						resetState();
						setMode("signin");
						setPhone("");
					}}>
						Sign In
					</button>
					<button
						type="button"
						className={`rounded-md px-4 py-2 ${mode === "signup" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
						onClick={() => {
						resetState();
						setMode("signup");
						setPhone("");
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

				{stage === "auth" && (
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

						{mode === "signup" ? (
							<div>
								<label className="block text-sm font-medium text-gray-700">Phone number</label>
								<input
									type="tel"
									value={phone}
									onChange={(event) => setPhone(event.target.value)}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
									placeholder="+12345678900"
								/>
							</div>
						) : null}

						<button
							type="submit"
							disabled={isLoading}
							className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
							{mode === "signup" ? "Create account" : "Sign in"}
						</button>
					</form>
				)}

				{stage === "phone" && (
					<form onSubmit={handlePhoneSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700">Phone number for 2FA</label>
							<input
								type="tel"
								value={phone}
								onChange={(event) => setPhone(event.target.value)}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								placeholder="+12345678900"
							/>
						</div>
						<button
							type="submit"
							disabled={isLoading}
							className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
							Send verification code
					</button>
					</form>
				)}

				{stage === "otp" && (
					<form onSubmit={handleOtpSubmit} className="space-y-4">
						<div className="rounded-md bg-gray-50 p-4 text-gray-700">
							<p className="text-sm">
								Enter the code sent to <strong>{pendingPhone}</strong>
							</p>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700">Verification code</label>
							<input
								type="text"
								value={verificationCode}
								onChange={(event) => setVerificationCode(event.target.value)}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								placeholder="123456"
							/>
						</div>
						<button
							type="submit"
							disabled={isLoading}
							className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
							Verify code
					</button>
					</form>
				)}

				{stage === "success" && (
					<div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-800">
						<p className="font-semibold">Authentication complete!</p>
						<p className="mt-2">Your account is now protected with phone-based 2FA.</p>
					</div>
				)}

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

			<div id="recaptcha-container" className="hidden" />
		</section>
	);
}
