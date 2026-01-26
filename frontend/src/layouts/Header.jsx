import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const Logo = () => (
	<div className="flex items-center gap-2 text-blue-700">
		<svg
			viewBox="0 0 64 32"
			className="h-6 w-10"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M3 19c6-6 10-9 18-9 10 0 12 9 22 9h18"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinecap="round"
			/>
			<path
				d="M27 10c4-5 10-8 19-8h6"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinecap="round"
			/>
		</svg>
		<span className="text-lg font-semibold">Rent My Car</span>
	</div>
);

const Avatar = ({ name }) => (
	<div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
		{name?.slice(0, 1)?.toUpperCase() || "U"}
	</div>
);

const NotificationBell = ({ count = 0 }) => (
	<div className="relative">
		<svg
			viewBox="0 0 24 24"
			className="h-5 w-5 text-slate-600"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
			/>
			<path
				d="M9 17a3 3 0 0 0 6 0"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
			/>
		</svg>
		{count > 0 && (
			<span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
				{count}
			</span>
		)}
	</div>
);

const NavLink = ({ to, children, active }) => (
	<Link
		to={to}
		className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
			active
				? "bg-blue-50 text-blue-700"
				: "text-slate-600 hover:bg-slate-100"
		}`}
	>
		{children}
	</Link>
);

const ProfileMenu = ({ user, roleLabel, onLogout }) => {
	const [open, setOpen] = useState(false);

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm transition hover:border-slate-300"
			>
				<Avatar name={user?.first_name || user?.name} />
				<div className="flex flex-col items-start text-xs">
					<span className="font-semibold">
						{user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "User"}
					</span>
					<span className="text-[10px] uppercase tracking-wide text-slate-400">
						{roleLabel}
					</span>
				</div>
				<svg
					viewBox="0 0 20 20"
					className="h-4 w-4 text-slate-500"
					fill="currentColor"
					aria-hidden="true"
				>
					<path d="M5.25 7.5 10 12.25 14.75 7.5" />
				</svg>
			</button>

			{open && (
				<div className="absolute right-0 mt-2 w-40 rounded-xl border border-slate-200 bg-white py-2 text-sm shadow-lg">
					<Link
						to="/profile"
						className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50"
					>
						<span>Profile</span>
					</Link>
					<Link
						to="/settings"
						className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50"
					>
						<span>Settings</span>
					</Link>
					<button
						type="button"
						onClick={onLogout}
						className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-500 hover:bg-red-50"
					>
						Logout
					</button>
				</div>
			)}
		</div>
	);
};

export default function Header({
	role = 1,
	user,
	isAuthenticated = false,
	onLogout,
	notifications = 0,
}) {
	const normalizedRole = useMemo(() => {
		if (typeof role === "string") return role.toLowerCase();
		if (role === 3) return "admin";
		if (role === 2) return "owner";
		return "customer";
	}, [role]);

	const roleLabel = useMemo(() => {
		if (normalizedRole === "admin") return "Admin";
		if (normalizedRole === "owner") return "Owner";
		return "Customer";
	}, [normalizedRole]);

	return (
		<header className="w-full bg-white">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
				<Link to="/" className="flex items-center">
					<Logo />
				</Link>

				{normalizedRole === "customer" && (
					<nav className="flex items-center gap-4">
						<div className="hidden items-center gap-2 md:flex">
							<NavLink to="/cars">Browse Cars</NavLink>
							<NavLink to="/how-it-works">How It Works</NavLink>
							<NavLink to="/become-a-host">Become a Host</NavLink>
						</div>
						{isAuthenticated ? (
							<ProfileMenu user={user} roleLabel={roleLabel} onLogout={onLogout} />
						) : (
							<div className="flex items-center gap-3">
								<Link
									to="/login"
									className="rounded-full border border-blue-700 px-4 py-1.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
								>
									Login
								</Link>
								<Link
									to="/signup"
									className="rounded-full bg-blue-700 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
								>
									Sign Up
								</Link>
							</div>
						)}
					</nav>
				)}

				{normalizedRole === "owner" && (
					<nav className="flex items-center gap-4">
						<div className="hidden items-center gap-2 lg:flex">
							<NavLink to="/owner/dashboard" active>
								Dashboard
							</NavLink>
							<NavLink to="/owner/vehicles">My Vehicles</NavLink>
							<NavLink to="/owner/vehicles/new">Add Vehicle</NavLink>
							<NavLink to="/owner/bookings">Bookings</NavLink>
							<NavLink to="/owner/earnings">Earnings</NavLink>
							<NavLink to="/owner/reviews">Reviews</NavLink>
						</div>
						<div className="flex items-center gap-4">
							<NotificationBell count={notifications} />
							<ProfileMenu user={user} roleLabel={roleLabel} onLogout={onLogout} />
						</div>
					</nav>
				)}

				{normalizedRole === "admin" && (
					<nav className="flex items-center gap-4">
						<div className="hidden items-center gap-2 lg:flex">
							<NavLink to="/admin/dashboard" active>
								Dashboard
							</NavLink>
							<NavLink to="/admin/users">User</NavLink>
							<NavLink to="/admin/vehicles">Vehicle</NavLink>
							<NavLink to="/admin/bookings">Booking</NavLink>
							<NavLink to="/admin/reports">Reports</NavLink>
							<NavLink to="/admin/settings">Settings</NavLink>
						</div>
						<div className="flex items-center gap-4">
							<NotificationBell count={notifications} />
							<ProfileMenu user={user} roleLabel={roleLabel} onLogout={onLogout} />
						</div>
					</nav>
				)}
			</div>
		</header>
	);
}
