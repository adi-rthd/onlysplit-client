import { Link } from 'react-router-dom';
import { Users, Receipt, CheckCircle, ArrowRight } from 'lucide-react';
import SEOHead from '../components/seo/SEOHead';
import { ROUTE_SEO } from '../constants/seoConfig';
import { ROUTES } from '../constants/routes';

const seo = ROUTE_SEO['/how-it-works'];

const steps = [
  {
    number: '1',
    title: 'Create a Group',
    description:
      'Start by creating a group for your trip, household, or any shared activity. Add members by name or invite them directly.',
    icon: Users,
    color: 'cyan',
    details: [
      'Name your group (e.g., "Goa Trip 2025")',
      'Add friends or roommates as members',
      'Set a default currency for the group',
    ],
  },
  {
    number: '2',
    title: 'Add Expenses',
    description:
      'Whenever someone pays for the group, log the expense. Choose how to split it — equally, by percentage, or custom amounts.',
    icon: Receipt,
    color: 'violet',
    details: [
      'Enter the amount and who paid',
      'Split equally, by percentage, or exact amounts',
      'Add notes and categories for easy tracking',
    ],
  },
  {
    number: '3',
    title: 'Settle Up',
    description:
      'OnlySplit calculates the simplest way to settle all debts. See exactly who owes whom and mark payments as complete.',
    icon: CheckCircle,
    color: 'lime',
    details: [
      'View optimized settlement suggestions',
      'Mark payments as settled with one tap',
      'Track your balance history over time',
    ],
  },
];

function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.04] bg-black/30 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto h-16 px-4 lg:px-8 flex items-center justify-between">
          <Link
            to={ROUTES.LANDING}
            className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            aria-label="OnlySplit home"
          >
            OnlySplit
          </Link>

          <nav aria-label="Main navigation">
            <ul className="flex items-center gap-6">
              <li>
                <Link
                  to={ROUTES.FEATURES}
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.HOW_IT_WORKS}
                  className="text-white font-medium text-sm"
                  aria-current="page"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.CONTACT}
                  className="text-white/60 hover:text-white transition-colors text-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTES.SIGNUP}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 px-4 text-center overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-[800px] h-[500px] -translate-x-1/2 -translate-y-1/2 bg-primary-container/15 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
              How OnlySplit{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Works
              </span>
            </h1>
            <p className="text-white/55 text-lg md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
              Splitting expenses has never been easier. Follow three simple steps
              to manage shared spending with friends, roommates, or travel
              companions.
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="max-w-6xl mx-auto px-4 pb-20" aria-label="Three-step process">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-16 text-white/90">
            Three Steps to Effortless Expense Splitting
          </h2>

          <div className="space-y-16 md:space-y-24">
            {steps.map((step) => {
              const Icon = step.icon;
              const colorMap = {
                cyan: {
                  iconBg: 'bg-cyan-400/10',
                  iconText: 'text-cyan-400',
                  numberBg: 'bg-cyan-400/20',
                  numberText: 'text-cyan-400',
                  dot: 'bg-cyan-400',
                },
                violet: {
                  iconBg: 'bg-violet-400/10',
                  iconText: 'text-violet-400',
                  numberBg: 'bg-violet-400/20',
                  numberText: 'text-violet-400',
                  dot: 'bg-violet-400',
                },
                lime: {
                  iconBg: 'bg-lime-400/10',
                  iconText: 'text-lime-400',
                  numberBg: 'bg-lime-400/20',
                  numberText: 'text-lime-400',
                  dot: 'bg-lime-400',
                },
              };
              const colors = colorMap[step.color];

              return (
                <div
                  key={step.number}
                  className="flex flex-col md:flex-row items-start gap-8 md:gap-12"
                >
                  {/* Step Number & Icon */}
                  <div className="flex-shrink-0 flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl ${colors.numberBg} flex items-center justify-center`}
                    >
                      <span className={`text-2xl font-black ${colors.numberText}`}>
                        {step.number}
                      </span>
                    </div>
                    <div
                      className={`w-14 h-14 rounded-2xl ${colors.iconBg} flex items-center justify-center`}
                    >
                      <Icon className={colors.iconText} size={28} />
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-white/55 text-lg leading-relaxed mb-6">
                      {step.description}
                    </p>
                    <ul className="space-y-3" aria-label={`Details for step ${step.number}`}>
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-3">
                          <span
                            className={`w-2 h-2 rounded-full mt-2.5 flex-shrink-0 ${colors.dot}`}
                            aria-hidden="true"
                          />
                          <span className="text-white/70">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-4 pb-24 text-center" aria-label="Call to action">
          <div className="rounded-[32px] border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-10 md:p-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Ready to Simplify Your Expenses?
            </h2>
            <p className="text-white/55 text-lg max-w-xl mx-auto mb-8">
              Join thousands of users who trust OnlySplit to manage shared
              spending. Get started for free today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to={ROUTES.SIGNUP}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-[15px] hover:opacity-90 transition-opacity shadow-[0_10px_40px_rgba(94,92,230,0.35)]"
              >
                Sign Up Free
                <ArrowRight size={18} />
              </Link>
              <Link
                to={ROUTES.DOWNLOAD}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] text-white hover:bg-white/[0.06] transition-all"
              >
                Download the App
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
                Product
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to={ROUTES.FEATURES} className="text-white/50 hover:text-white transition-colors text-sm">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.DOWNLOAD} className="text-white/50 hover:text-white transition-colors text-sm">
                    Download
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to={ROUTES.BLOG} className="text-white/50 hover:text-white transition-colors text-sm">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.CONTACT} className="text-white/50 hover:text-white transition-colors text-sm">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to={ROUTES.PRIVACY_POLICY} className="text-white/50 hover:text-white transition-colors text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.TERMS} className="text-white/50 hover:text-white transition-colors text-sm">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
                Compare
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to={ROUTES.SPLITWISE_ALTERNATIVE} className="text-white/50 hover:text-white transition-colors text-sm">
                    Splitwise Alternative
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-white/[0.06] text-center">
            <p className="text-white/40 text-sm">
              &copy; {new Date().getFullYear()} OnlySplit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HowItWorksPage;
