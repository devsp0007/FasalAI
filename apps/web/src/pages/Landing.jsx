import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useAuth } from '../contexts/AuthContext';
import AzureTranslate from '../components/AzureTranslate';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Predict button: if logged in → dashboard, else → login
  const handlePredict = () => navigate(isAuthenticated ? '/' : '/login');

  return (
    <div className="min-h-screen bg-white text-[#06231c] antialiased">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#e5eee9] bg-white/90 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00875A] text-white shadow-[0_18px_50px_-24px_rgba(0,135,90,0.22)]">
              <span className="text-lg font-extrabold">F</span>
            </div>
            <div className="leading-tight">
              <div className="text-base font-extrabold tracking-tight">Fasal AI</div>
              <div className="text-xs font-medium text-[#5f726a]"><AzureTranslate text="Smart Crop Advisory" /></div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#5f726a]">
            <a href="#home" className="hover:text-[#00875A] transition-colors"><AzureTranslate text="Home" /></a>
            <a href="#solutions" className="hover:text-[#00875A] transition-colors"><AzureTranslate text="Solutions" /></a>
            <a href="#how-it-works" className="hover:text-[#00875A] transition-colors"><AzureTranslate text="How it works" /></a>
            <a href="#contact" className="hover:text-[#00875A] transition-colors"><AzureTranslate text="Contact" /></a>
          </div>

          <div className="flex items-center gap-3">
            <div className="mr-2 lg:mr-4">
              <LanguageSwitcher />
            </div>
            <button onClick={() => navigate('/login')} className="hidden sm:inline-flex rounded-full border border-[#e5eee9] bg-white px-5 py-2.5 text-sm font-bold text-[#06231c] hover:border-[#00875A] hover:text-[#00875A] transition-colors">
              <AzureTranslate text="Login" />
            </button>
            <button onClick={handlePredict} className="inline-flex rounded-full bg-[#00875A] px-5 py-2.5 text-sm font-bold text-white shadow-[0_18px_50px_-24px_rgba(0,135,90,0.22)] hover:shadow-[0_0_0_1px_rgba(0,135,90,0.08),0_22px_60px_-28px_rgba(0,135,90,0.28)] transition-all">
              <AzureTranslate text="Predict Now" />
            </button>
            <button className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e5eee9] text-[#06231c]">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </nav>
      </header>

      <main id="home" className="pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="min-h-[88vh]" style={{ backgroundImage: "linear-gradient(180deg, rgba(6,35,28,0.55), rgba(6,35,28,0.2)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAaiCDHlDcZCPqYUOedRF722sRndlODl2fI5BFcXjvqpL0EwgGKNNH0qpA1gmv5LeNnUN06d17q3r_53aeRVjReLuhk5j08o2ON9cmyq03206CFohsxk6J1kympdLKWw_fwlFf9WTWOkr_fBk5OZaIbaOeiCWDKHKJP-5Xj48-xDAJtsLumdrfLo5wzYv8mRasNZogrfibHZzWKglz-ocPrFj3DVGnxrmoZV-noG08nZkGvOy9hN_WmQzgPB_N2f7o_XVszR3EJPHzT')", backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat'}}>
            <div className="mx-auto flex min-h-[88vh] max-w-7xl items-center px-4 sm:px-6 lg:px-8 py-14">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-white/95">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <AzureTranslate text="India-first crop intelligence" />
                </div>

                <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl leading-[1.02]">
                  <AzureTranslate text="Smarter crop decisions." />
                  <span className="block text-emerald-200"><AzureTranslate text="Cleaner farming outcomes." /></span>
                </h1>

                <p className="mt-6 max-w-2xl text-base sm:text-lg leading-8 text-white/85">
                  <AzureTranslate text="Get crop recommendations, rotation planning, pest alerts, fertilizer guidance, and market insights in one place — built for Indian farmers and agribusiness teams." />
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <button onClick={handlePredict} className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-extrabold text-[#00875A] shadow-[0_18px_50px_-24px_rgba(0,135,90,0.22)] hover:-translate-y-0.5 transition-transform">
                    <AzureTranslate text="Predict Now" />
                  </button>
                  <button onClick={() => navigate('/login')} className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-4 text-sm font-extrabold text-white hover:bg-white/20 transition-colors">
                    <AzureTranslate text="Login" />
                  </button>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3 max-w-3xl">
                  <div className="rounded-2xl border border-white/15 px-4 py-4 text-white shadow-[0_18px_50px_-24px_rgba(0,135,90,0.22)] bg-white/10 backdrop-blur-md">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/70 font-bold"><AzureTranslate text="Crop Advisory" /></div>
                    <div className="mt-1 text-sm font-semibold"><AzureTranslate text="State, soil, weather aware" /></div>
                  </div>
                  <div className="rounded-2xl border border-white/15 px-4 py-4 text-white shadow-[0_18px_50px_-24px_rgba(0,135,90,0.22)] bg-white/10 backdrop-blur-md">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/70 font-bold"><AzureTranslate text="Rotation Planner" /></div>
                    <div className="mt-1 text-sm font-semibold"><AzureTranslate text="Season-based planning" /></div>
                  </div>
                  <div className="rounded-2xl border border-white/15 px-4 py-4 text-white shadow-[0_18px_50px_-24px_rgba(0,135,90,0.22)] bg-white/10 backdrop-blur-md">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/70 font-bold"><AzureTranslate text="Alerts" /></div>
                    <div className="mt-1 text-sm font-semibold"><AzureTranslate text="Pest, weather and market" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions */}
        <section id="solutions" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-[#00875A]"><AzureTranslate text="Solutions" /></p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#06231c]"><AzureTranslate text="Everything a farmer needs, without clutter" /></h2>
            <p className="mt-4 text-base leading-7 text-[#5f726a]"><AzureTranslate text="The landing page now focuses on the few actions that matter most: understand, decide, and act. No distracting enterprise buttons, no unnecessary panels, no noisy technical labels." /></p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <article className="rounded-3xl border border-[#e5eee9] bg-white p-6 shadow-[0_18px_50px_-24px_rgba(0,135,90,0.22)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#00875A] text-2xl">🌱</div>
              <h3 className="mt-5 text-xl font-extrabold"><AzureTranslate text="Crop Recommendation" /></h3>
              <p className="mt-3 text-sm leading-7 text-[#5f726a]"><AzureTranslate text="State, soil, season, rainfall, and crop history guided suggestions." /></p>
            </article>
            <article className="rounded-3xl border border-[#e5eee9] bg-white p-6 shadow-[0_18px_50px_-24px_rgba(0,135,90,0.22)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#00875A] text-2xl">🐛</div>
              <h3 className="mt-5 text-xl font-extrabold"><AzureTranslate text="Pest Alerts" /></h3>
              <p className="mt-3 text-sm leading-7 text-[#5f726a]"><AzureTranslate text="Season-aware pest warnings and simple guidance for immediate action." /></p>
            </article>
            <article className="rounded-3xl border border-[#e5eee9] bg-white p-6 shadow-[0_18px_50px_-24px_rgba(0,135,90,0.22)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#00875A] text-2xl">🧪</div>
              <h3 className="mt-5 text-xl font-extrabold"><AzureTranslate text="Fertilizer & Remedies" /></h3>
              <p className="mt-3 text-sm leading-7 text-[#5f726a]"><AzureTranslate text="Practical fertilizer advice with natural alternatives when soil nutrients are low." /></p>
            </article>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-y border-[#e5eee9] bg-[#f8faf9]/60 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.25em] text-[#00875A]"><AzureTranslate text="How it works" /></p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight"><AzureTranslate text="Simple flow, strong visual hierarchy, zero noise" /></h2>
              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-[#e5eee9] bg-white p-4 shadow-[0_18px_50px_-24px_rgba(0,135,90,0.22)]">
                  <div className="text-sm font-extrabold"><AzureTranslate text="1. Select your state or field" /></div>
                  <div className="mt-1 text-sm text-[#5f726a]"><AzureTranslate text="The app uses your location, soil, and season context." /></div>
                </div>
                <div className="rounded-2xl border border-[#e5eee9] bg-white p-4 shadow-[0_18px_50px_-24px_rgba(0,135,90,0.22)]">
                  <div className="text-sm font-extrabold"><AzureTranslate text="2. Get recommendation instantly" /></div>
                  <div className="mt-1 text-sm text-[#5f726a]"><AzureTranslate text="Crop, pest, fertilizer, yield, and market cards update in real time." /></div>
                </div>
                <div className="rounded-2xl border border-[#e5eee9] bg-white p-4 shadow-[0_18px_50px_-24px_rgba(0,135,90,0.22)]">
                  <div className="text-sm font-extrabold"><AzureTranslate text="3. Login only when needed" /></div>
                  <div className="mt-1 text-sm text-[#5f726a]"><AzureTranslate text="A single login entry remains available in the top bar for quick access." /></div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#e5eee9] bg-white p-6 sm:p-8 shadow-[0_18px_50px_-24px_rgba(0,135,90,0.22)]">
              <div className="rounded-[1.75rem] bg-emerald-950 p-6 text-white">
                <div className="text-xs font-bold uppercase tracking-[0.25em] text-white/65"><AzureTranslate text="Clean UI focus" /></div>
                <div className="mt-3 text-2xl font-extrabold leading-tight"><AzureTranslate text="No distracting buttons. No unused marketing clutter." /></div>
                <p className="mt-4 text-sm leading-7 text-white/80"><AzureTranslate text="The page now keeps only the actions that help a user start quickly and understand the product at a glance." /></p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="rounded-[2.5rem] bg-[#00875A] px-6 py-12 sm:px-10 sm:py-16 text-center text-white shadow-[0_18px_50px_-24px_rgba(0,135,90,0.22)]">
            <p className="text-sm font-extrabold uppercase tracking-[0.3em] text-white/70"><AzureTranslate text="Ready to begin" /></p>
            <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight"><AzureTranslate text="Start with a clean, focused agriculture dashboard" /></h2>
            <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg leading-8 text-white/85">
              <AzureTranslate text="Fasal AI now gives you one simple entry point: predict, then log in when you need to save, manage fields, or view deeper insights." />
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={handlePredict} className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-sm font-extrabold text-[#00875A] hover:opacity-95 transition-opacity"><AzureTranslate text="Predict Now" /></button>
              <button onClick={() => navigate('/login')} className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-4 text-sm font-extrabold text-white hover:bg-white/10 transition-colors"><AzureTranslate text="Login" /></button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
