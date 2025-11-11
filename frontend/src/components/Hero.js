import Navbar from "./Navbar";
import Card from "./Card";

const Hero = () => {
	return (
		<div className="min-h-screen bg-[var(--brand-50)]">
			<div className="pl-72">
				<Navbar />
			</div>

			{/* Hero header */}
			<section className="pl-72 bg-[var(--brand-100)]">
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
							className="w-full max-h-[520px] object-contain rounded-xl bg-[var(--brand-100)]"
						/>
						<div className="flex flex-col p-12">
							<p className="text-2xl text-[var(--brand-900)] font-semibold leading-relaxed">
								Manage your portfolio of stocks, ETFs, and cryptocurrencies with ease using our services.
							</p>
							<button className="rounded-sm bg-[var(--brand-900)]"> Get Started </button>
						</div>
					</div>

					<div className="mt-16" />

					<div className="flex gap-5">
						<Card
							title="Smart Portfolio Tracking"
							icon="test"
							desc="Gain a complete view of your financial landscape with Fincrate’s unified dashboard. 
							Track your stocks, ETFs, and crypto in real time, visualize performance trends, 
							and make informed decisions with clarity and confidence."
						>
						</Card>
						<Card
							title="AI-Driven Insights"
							icon="test"
							desc="Stay ahead of the market with intelligent recommendations powered by Fincrate’s AI engine. 
							Our models analyze live market data and your unique risk profile to surface personalized investment 
							opportunities — no guesswork required."
						>
						</Card>
						<Card
							title="Secure & Transparent"
							icon="test"
							desc="Your trust is our foundation. Fincrate safeguards your financial data with advanced encryption, 
							verified authentication, and full transparency in every transaction — so you can invest with peace of mind."
						>
						</Card>
					</div>
				</div>
			</section>
		</div>
	);
}

export default Hero;
