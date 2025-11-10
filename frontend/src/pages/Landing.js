import BannerBar from "../components/BannerBar";
import Hero from "../components/Hero";


const Landing = () => {
	return (
		<div>
			<BannerBar></BannerBar>
			<Hero className="bg-[var(--brand-50)]"></Hero>
		</div>
	);
};

export default Landing;
