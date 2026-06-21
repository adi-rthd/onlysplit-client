import { Link } from 'react-router-dom';
import {
  Users,
  Zap,
  Globe,
  RefreshCw,
  Shield,
  BarChart3,
  Smartphone,
  ArrowRight,
} from 'lucide-react';

import SEOHead from '../components/seo/SEOHead';
import { ROUTE_SEO } from '../constants/seoConfig';
import { ROUTES } from '../constants/routes';

const featuresSeo = ROUTE_SEO['/features'];

const features = [
  {
    icon: Users,
    title: 'Group Expense Tracking',
    description:
      'Create groups for trips, roommates, or any shared spending. Add expenses on the go and everyone stays in sync automatically.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
  },
  {
    icon: Zap,
    title: 'Smart Settlements',
    description:
      'Our algorithm minimizes the number of transactions needed to settle up. No more complex calculations or back-and-forth payments.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: RefreshCw,
    title: 'Real-Time Sync',
    description:
      'Every expense, payment, and balance update syncs instantly across all devices. Your group always sees the latest numbers.',
    color: 'text-lime-400',
    bg: 'bg-lime-400/10',
  },
  {
    icon: Globe,
    title: 'Multi-Currency Support',
    description:
      'Splitting costs across borders? Handle multiple currencies with automatic conversion so international trips stay simple.',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
  },
  {
    icon: BarChart3,
    title: 'Spending Analytics',
    description:
      'Visualize your spending patterns with detailed charts and breakdowns. Understand where your money goes across all groups.',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    icon: Shield,
    title: 'Secure and Private',
    description:
      'Your financial data is encrypted end-to-end. We never sell your information or show ads. Your privacy comes first.',
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
  },
];

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      <SEOHead
        title={featuresSeo.title}
        description={featuresSeo.description}
        keywords={featuresSeo.keywords}
      />

      {/* Background gradients */}
      <div className="absolute top-[-5%] left-[-5%] w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(94,92,230,0.08)_0%,transparent_90%)] blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-8%] w-[660px] h-[660px] rounded-full bg-[radial-gradient(circle,rgba(62,144,255,0.05)_0%,transparent_90%)] blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.04] bg-black/30 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto h-16 px-4 lg:px-8 flex items-center justify-between">
          <Link
            to={ROUTES.LANDING}
            className="flex items-center gap-2"
            aria-label="OnlySplit home"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden">
              <img
                src="/logo.png"
                alt="OnlySplit logo"
                width="36"
                height="36"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              OnlySplit
            </span>
          </Link>

          <nav aria-label="Main navigation">
            <ul className="flex items-center gap-1">
              <li>
                <Link
                  to={ROUTES.HOW_IT_WORKS}
                  className="px-4 py-2 rounded-xl text-white/55 hover:text-white hover:bg-white/[0.05] transition-all text-sm"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.CONTACT}
                  className="px-4 py-2 rounded-xl text-white/55 hover:text-white hover:bg-white/[0.05] transition-all text-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.SIGNUP}
                  className="ml-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Powerful Features for{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Effortless Splitting
              </span>
            </h1>
            <p className="text-white/55 text-lg md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
              OnlySplit gives you everything you need to manage shared expenses.
              From group tracking to smart settlements, we make splitting simple.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-4 pb-24">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-14">
            Everything You Need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-3xl border border-white/[0.05] bg-white/[0.02] p-8 hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}
                  >
                    <Icon className={feature.color} size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/50 leading-relaxed">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* How it works teaser */}
        <section className="max-w-5xl mx-auto px-4 pb-24">
          <div className="rounded-3xl border border-white/[0.05] bg-white/[0.02] p-10 md:p-14 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Simple to Get Started
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto mb-8">
              Create a group, add your expenses, and let OnlySplit handle the
              math. Settle up with minimal transactions.
            </p>
            <Link
              to={ROUTES.HOW_IT_WORKS}
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Learn how it works
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-5xl mx-auto px-4 pb-24">
          <div className="rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/20 p-10 md:p-14 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Ready to Split Smarter?
            </h2>
            <p className="text-white/55 text-lg max-w-xl mx-auto mb-8">
              Join thousands of users who have simplified their shared expenses
              with OnlySplit. Free to use, no ads, no compromises.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to={ROUTES.SIGNUP}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:opacity-90 transition-opacity shadow-[0_10px_40px_rgba(94,92,230,0.3)]"
              >
                Sign Up Free
                <ArrowRight size={18} />
              </Link>
              <Link
                to={ROUTES.DOWNLOAD}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] text-white font-medium hover:bg-white/[0.05] transition-all"
              >
                <Smartphone size={18} />
                Download App
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <nav aria-label="Footer navigation" className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <h3 className="text-white/80 font-semibold mb-4 text-sm uppercase tracking-wider">
                Product
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to={ROUTES.FEATURES}
                    className="text-white/45 hover:text-white transition-colors text-sm"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.HOW_IT_WORKS}
                    className="text-white/45 hover:text-white transition-colors text-sm"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.DOWNLOAD}
                    className="text-white/45 hover:text-white transition-colors text-sm"
                  >
                    Download
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white/80 font-semibold mb-4 text-sm uppercase tracking-wider">
                Compare
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to={ROUTES.SPLITWISE_ALTERNATIVE}
                    className="text-white/45 hover:text-white transition-colors text-sm"
                  >
                    Splitwise Alternative
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white/80 font-semibold mb-4 text-sm uppercase tracking-wider">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to={ROUTES.CONTACT}
                    className="text-white/45 hover:text-white transition-colors text-sm"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.BLOG}
                    className="text-white/45 hover:text-white transition-colors text-sm"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white/80 font-semibold mb-4 text-sm uppercase tracking-wider">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to={ROUTES.PRIVACY_POLICY}
                    className="text-white/45 hover:text-white transition-colors text-sm"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.TERMS}
                    className="text-white/45 hover:text-white transition-colors text-sm"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
          <div className="border-t border-white/[0.05] pt-8 text-center">
            <p className="text-white/35 text-sm">
              &copy; {new Date().getFullYear()} OnlySplit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeaturesPage;
