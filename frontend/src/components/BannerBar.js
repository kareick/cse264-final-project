import { Libre_Baskerville } from "next/font/google";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const BannerBar = () => {
    return (
        <aside className="fixed left-0 top-0 h-screen w-72 text-white shadow-xl bg-gradient-to-b from-[var(--brand-600)] to-[var(--brand-800)]">
        {/* Brand block */}
        <div className="h-20 flex items-center px-6 border-b border-white/10">
            <div className={`text-left leading-tight ${libreBaskerville.className}`}>
            <div className="text-2xl font-semibold tracking-wide italic"> Fincrate </div>
            </div>
        </div>

        {/* Footer / CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <button className="w-full rounded-lg bg-white/10 hover:bg-white/20 py-2 text-sm">
            Get Started
            </button>
        </div>
        </aside>
    );
};

export default BannerBar;