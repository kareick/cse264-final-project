import Navbar from "./Navbar";
import Card from "./Card";

const Hero = () => {
	return (
		<div className="min-h-screen bg-[var(--brand-50)]">
			<div className="pl-72">
				<Navbar />
			</div>

			{/* Hero header */}
			<section className="pl-72 bg-[var(--brand-50)]">
				<div className="mx-auto max-w-6xl px-6 py-16">
					<div className="mt-4">
						<p className="text-5xl sm:text-6xl font-extrabold text-[var(--brand-900)] tabular-nums">
							Welcome to Fincrate
						</p>
						<p className="font-semibold mt-2 text-[var(--brand-800)]">
							Start tracking your finances today with Fincrate
						</p>
					</div>
					{/* Illustration */}
					<div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-center">
						<img
							src="/Hero.png"
							alt="Finance"
							className="w-full max-h-[520px] object-contain rounded-xl bg-[var(--brand-50)]"
						/>
						<p className="text-2xl text-[var(--brand-900)] font-semibold leading-relaxed">
							Manage your portfolio of stocks, ETFs, and cryptocurrencies with ease using our services.
						</p>
					</div>

					<div className="mt-16" />

					<div className="flex">
						<Card 
							title="Smart Portfolio Tracking" 
							icon=""
							desc="View your entire portfolio in one place — 
							from stocks and ETFs to crypto assets. Fincrate automatically 
							updates prices and performance in real time, giving you a clear 
							snapshot of your financial growth."
						>
						</Card>
						<Card 
							title="AI-Driven Insights" 
							icon=""
							desc="View your entire portfolio in one place — 
							from stocks and ETFs to crypto assets. Fincrate automatically 
							updates prices and performance in real time, giving you a clear 
							snapshot of your financial growth."
						>
						</Card>
						<Card 
							title="Secure & Transparent" 
							icon=""
							desc="View your entire portfolio in one place — 
							from stocks and ETFs to crypto assets. Fincrate automatically 
							updates prices and performance in real time, giving you a clear 
							snapshot of your financial growth."
						>
						</Card>
					</div>
				</div>
			</section>
		</div>
	);
}

export default Hero;
