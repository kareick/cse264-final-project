import Navbar from "./Navbar";

const Hero = () => {
	return ( 
		<div className="bg-[var(--brand-50)]">
			<div className="ml-72"> 
				<Navbar />
			</div>

			{/* Hero header */}
			<section className="ml-72 bg-[var(--brand-50)]">
				<div className="mx-auto max-w-6xl px-6 py-10">
					<div className="mt-4">
						<p className="text-5xl sm:text-6xl font-extrabold text-[var(--brand-900)] tabular-nums">
                        Welcome to Fincrate
						</p>
						<p className="font-semibold mt-2 text-[var(--brand-800)]">
                        Start tracking your finances today with Fincrate
						</p>
					</div>
					{/* Illustration */}
					<div className="mt-10 flex">
						<img
							src="/Hero.png"
							alt="Finance illustration"
							className="w-full max-h-[520px] object-contain rounded-xl bg-[var(--brand-50)]"
						/>
            <p className="text-3xl text-[var(--brand-900)] font-bold content-center">
                Manage your portfolio of stocks, ETFs, and cryptocurrencies with ease using our services.
            </p>
					</div>
				</div>
			</section>
		</div>
	);
}

export default Hero;
