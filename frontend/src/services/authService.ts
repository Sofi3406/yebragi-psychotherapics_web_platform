const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

async function handleResponse(res: Response) {
	const text = await res.text();
	try {
		const json = text ? JSON.parse(text) : {};
		if (!res.ok) throw json || new Error(res.statusText);
		return json;
	} catch (err) {
		if (!res.ok) throw err;
		return {} as any;
	}
}

async function register(email: string, password: string, fullName: string) {
	const res = await fetch(`${API_URL}/api/v1/auth/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password, fullName }),
	});
	return await handleResponse(res);
}

async function login(email: string, password: string) {
	const res = await fetch(`${API_URL}/api/v1/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	});
	return await handleResponse(res);
}

async function verify(email: string, otp: string) {
	const res = await fetch(`${API_URL}/api/v1/auth/verify`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, otp }),
	});
	return await handleResponse(res);
}

async function resendOtp(email: string) {
	const res = await fetch(`${API_URL}/api/v1/auth/resend-otp`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email }),
	});
	return await handleResponse(res);
}

async function refresh(refreshToken: string) {
	const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ refreshToken }),
	});
	return await handleResponse(res);
}

export const authService = {
	register,
	login,
	verify,
	resendOtp,
	refresh,
};

export default authService;

