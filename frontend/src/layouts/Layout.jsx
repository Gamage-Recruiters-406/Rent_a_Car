import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({
	children,
	showFooter = true,
}) {
	const [user, setUser] = useState(null);
	const [role, setRole] = useState(1);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [fetchAttempted, setFetchAttempted] = useState(false);
	const location = useLocation();

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
	const API_VERSION = import.meta.env.VITE_API_VERSION || "";

	useEffect(() => {
		const fetchUser = async () => {
			if (fetchAttempted) return; // Prevent repeated fetches
			
			try {
				console.log("Fetching user details from:", `${API_BASE_URL}${API_VERSION}/authUser/getUserDetails`);
				const response = await fetch(
					`${API_BASE_URL}${API_VERSION}/authUser/getUserDetails`,
					{
						method: "GET",
						credentials: "include",
					}
				);

				console.log("Response status:", response.status);
				if (!response.ok) {
					console.log("Response not ok, status:", response.status);
					setUser(null);
					setRole(1);
					setIsAuthenticated(false);
					setFetchAttempted(true);
					return;
				}

				const data = await response.json();
				console.log("User data received:", data);
				if (data?.success && data?.user) {
					console.log("Setting user role:", data.user.role);
					setUser(data.user);
					setRole(data.user.role ?? 1);
					setIsAuthenticated(true);
				} else {
					console.log("No user data in response");
					setUser(null);
					setRole(1);
					setIsAuthenticated(false);
				}
				setFetchAttempted(true);
			} catch (error) {
				console.error("Failed to fetch user details", error);
				setUser(null);
				setRole(1);
				setIsAuthenticated(false);
				setFetchAttempted(true);
			}
		};

		fetchUser();
	}, [location.pathname]);

	const handleLogout = async () => {
		try {
			await fetch(`${API_BASE_URL}${API_VERSION}/authUser/logout`, {
				method: "POST",
				credentials: "include",
			});
		} catch (error) {
			console.error("Logout failed", error);
		}
		setUser(null);
		setRole(1);
		setIsAuthenticated(false);
	};

	const headerProps = useMemo(
		() => ({
			role,
			isAuthenticated,
			user,
			notifications: 0,
			onLogout: handleLogout,
		}),
		[role, isAuthenticated, user]
	);

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<Header {...headerProps} />
			<main className="min-h-[70vh]">{children}</main>
			{showFooter && <Footer />}
		</div>
	);
}
