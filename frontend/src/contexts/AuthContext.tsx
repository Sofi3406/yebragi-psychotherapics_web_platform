import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

type Role = "PATIENT" | "THERAPIST" | string;

type User = {
	id: string;
	email: string;
	fullName?: string;
	role?: Role;
	isVerified?: boolean;
};

type AuthContextType = {
	user: User | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (
		email: string,
		password: string,
		fullName: string,
		role?: Role
	) => Promise<void>;
	verify: (email: string, otp: string) => Promise<void>;
	logout: () => void;
	refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

const storage = {
	getAccess: () => localStorage.getItem("accessToken"),
	getRefresh: () => localStorage.getItem("refreshToken"),
	setTokens: (access?: string | null, refresh?: string | null) => {
		if (access) localStorage.setItem("accessToken", access);
		else localStorage.removeItem("accessToken");
		if (refresh) localStorage.setItem("refreshToken", refresh);
		else localStorage.removeItem("refreshToken");
	},
	clear: () => {
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
	},
};

async function handleResponse(res: Response) {
	const text = await res.text();
	try {
		const json = text ? JSON.parse(text) : {};
		if (!res.ok) throw new Error(json?.message || res.statusText || "Request failed");
		return json;
	} catch (err) {
		// if not JSON or other parse error
		if (!res.ok) throw new Error(res.statusText || "Request failed");
		return {} as any;
	}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	const logout = () => {
		storage.clear();
		setUser(null);
	};

		const login = async (email: string, password: string) => {
		try {
			const res = await fetch(`${API_URL}/api/v1/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			const data = await handleResponse(res);
			if (data?.accessToken) {
				storage.setTokens(data.accessToken, data.refreshToken);
					setUser(data.user || null);
					toast.success("Logged in");
					return data.user || null;
			}
		} catch (err: any) {
			toast.error(err?.message || "Login failed");
			throw err;
		}
	};

	const register = async (email: string, password: string, fullName: string, role?: Role) => {
		try {
			// Backend register expects fullName, email, password
			const res = await fetch(`${API_URL}/api/v1/auth/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password, fullName }),
			});
			const data = await handleResponse(res);
			toast.success(data?.message || "Registered. Check email for OTP.");
		} catch (err: any) {
			toast.error(err?.message || "Registration failed");
			throw err;
		}
	};

	const verify = async (email: string, otp: string) => {
		try {
			const res = await fetch(`${API_URL}/api/v1/auth/verify`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, otp }),
			});
			const data = await handleResponse(res);
			if (data?.accessToken) {
				storage.setTokens(data.accessToken, data.refreshToken);
					setUser(data.user || null);
					toast.success("Account verified");
					return data.user || null;
			}
		} catch (err: any) {
			toast.error(err?.message || "Verification failed");
			throw err;
		}
	};

	const refreshUser = async () => {
		setLoading(true);
		try {
			let access = storage.getAccess();
			const refresh = storage.getRefresh();

			const fetchProfile = async (token: string) => {
				const r = await fetch(`${API_URL}/api/users/me`, {
					method: "GET",
					headers: { Authorization: `Bearer ${token}` },
				});
				return await handleResponse(r);
			};

			if (access) {
				try {
					const profile = await fetchProfile(access);
					setUser(profile);
					setLoading(false);
					return;
				} catch (err) {
					// try refresh below
				}
			}

			if (refresh) {
				const r = await fetch(`${API_URL}/api/v1/auth/refresh`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ refreshToken: refresh }),
				});
				const data = await handleResponse(r);
				access = data?.accessToken;
				if (access) {
					storage.setTokens(access, refresh);
					const profile = await fetchProfile(access);
					setUser(profile);
					setLoading(false);
					return;
				}
			}

			// if we reach here, unauthenticated
			logout();
		} catch (err) {
			logout();
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		// Attempt to restore session on mount
		refreshUser();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<AuthContext.Provider value={{ user, loading, login, register, verify, logout, refreshUser }}>
			{children}
		</AuthContext.Provider>
	);
};

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}

export default AuthContext;

