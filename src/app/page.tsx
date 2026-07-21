"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Calendar,
  Pill,
  Bot,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
  Menu,
  X,
  Moon,
  Sun,
  Globe,
} from "lucide-react";

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const isDarkMode =
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(isDarkMode);

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "light" : "dark");
  };

  const stats = [
    { value: "53M", label: "Family caregivers in the US" },
    { value: "78%", label: "Manage medications for loved ones" },
    { value: "40hrs", label: "Average weekly care hours" },
    { value: "65%", label: "Report high stress levels" },
  ];

  const features = [
    {
      icon: Bot,
      title: "AI Care Planning",
      description:
        "Generate personalized care plans instantly. Our AI analyzes conditions, medications, and needs to create comprehensive daily routines.",
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: Pill,
      title: "Medication Management",
      description:
        "Track medications, set refill reminders, and get alerts for potential interactions. Never miss a dose again.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Calendar,
      title: "Appointment Coordination",
      description:
        "Manage all healthcare appointments in one place. Get reminders and share schedules with family members.",
      color: "from-violet-500 to-purple-500",
    },
    {
      icon: Users,
      title: "Family Collaboration",
      description:
        "Invite family members to coordinate care. Share updates, assign tasks, and stay connected about your loved one's wellbeing.",
      color: "from-rose-500 to-pink-500",
    },
    {
      icon: Shield,
      title: "Resource Navigator",
      description:
        "Find community resources, financial assistance programs, and support groups. AI matches needs to available help.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Sparkles,
      title: "Medical Explanations",
      description:
        "Upload or paste medical documents and get plain-language explanations. Understand conditions, treatments, and next steps.",
      color: "from-cyan-500 to-blue-500",
    },
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Caring for mother with dementia",
      content:
        "Compass has been a lifesaver. I was drowning in medication schedules and doctor appointments. Now I have everything in one place and the AI helps me plan ahead.",
      rating: 5,
    },
    {
      name: "James L.",
      role: "Caring for father post-stroke",
      content:
        "The care plan feature is incredible. It generated a comprehensive daily routine that our home health aide follows. My siblings and I can finally coordinate effectively.",
      rating: 5,
    },
    {
      name: "Maria G.",
      role: "Long-distance caregiver",
      content:
        "Living in another state while caring for my abuela was stressful. Compass lets me check in, track medications, and coordinate with her local caregivers from anywhere.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-gray-950 dark:via-blue-950/10 dark:to-gray-950">
      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b" : ""
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Compass
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {isLoaded && isSignedIn ? (
                <div className="flex items-center gap-4">
                  <Link href="/dashboard">
                    <Button size="sm">
                      Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                <UserButton />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">
                    Sign in
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button size="sm">
                      Get Started Free
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </SignUpButton>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Nav */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t animate-in slide-in-from-top-2">
              <div className="flex flex-col gap-3">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDark ? "Light Mode" : "Dark Mode"}
                </button>
                {isLoaded && isSignedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <div className="px-4">
                      <UserButton />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-4">
                      <SignInButton mode="modal">
                        <Button variant="ghost" className="w-full">
                          Sign in
                        </Button>
                      </SignInButton>
                    </div>
                    <div className="px-4">
                      <SignUpButton mode="modal">
                        <Button className="w-full">
                          Get Started Free
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </SignUpButton>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              AI-Powered Care Coordination
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent">
                Compassionate Care,{" "}
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              The all-in-one platform that helps family caregivers coordinate care,
              manage medications, and find resources — so you can focus on what matters most.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              {isLoaded && isSignedIn ? (
                <Link href="/dashboard">
                  <Button size="xl" className="w-full sm:w-auto group">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <>
                  <SignUpButton mode="modal">
                    <Button size="xl" className="w-full sm:w-auto group">
                      Start Free
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <Button size="xl" variant="outline" className="w-full sm:w-auto">
                      Sign In
                    </Button>
                  </SignInButton>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                coordinate care
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From medication tracking to family collaboration, Compass brings all the tools
              caregivers need into one intuitive platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 lg:p-8 rounded-2xl border bg-white dark:bg-gray-900/50 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Get started in{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                minutes
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No complicated setup. Just the tools you need to start coordinating care.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Create Your Profile",
                desc: "Tell us about yourself and your loved one. It takes just a few minutes.",
              },
              {
                step: "02",
                title: "Generate Care Plan",
                desc: "AI creates a personalized care plan based on conditions, medications, and needs.",
              },
              {
                step: "03",
                title: "Coordinate & Track",
                desc: "Manage medications, appointments, and tasks. Invite family to help.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/25">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Trusted by{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                caregivers
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Hear from family caregivers who use Compass every day.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 lg:p-8 rounded-2xl border bg-white dark:bg-gray-900/50 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 sm:p-12 lg:p-16 text-center">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Start caring with Compass
              </h2>
              <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-xl mx-auto">
                Join thousands of family caregivers who use Compass to coordinate care for their loved ones.
              </p>
              {isLoaded && isSignedIn ? (
                <Link href="/dashboard">
                  <Button
                    size="xl"
                    variant="secondary"
                    className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl shadow-black/10 group"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <SignUpButton mode="modal">
                  <Button
                    size="xl"
                    variant="secondary"
                    className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl shadow-black/10 group"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </SignUpButton>
              )}
              <p className="text-blue-200 text-sm mt-4">Free forever. No credit card required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Heart className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-bold">Compass</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <span>Built with ❤️ for family caregivers</span>
              <span>&copy; 2026 Compass</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
