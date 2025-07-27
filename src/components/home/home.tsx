'use client'


import Image from "next/image";
import { FaYoutube } from "react-icons/fa6";
import Footer_W from "@/components/ui_components/footer_w";

export default function JAlgoPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Hero Logo Section */}
            <section className="pt-8 pb-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex w-full justify-center items-center">
                        <Image
                            src="/jalgo_logo_dark_3.png"
                            alt="JALGO.AI - AI-Powered Career Platform Logo"
                            width={500}
                            height={98}
                            className="hover:opacity-90 transition-opacity duration-300 max-w-full h-auto"
                            priority
                        />
                    </div>
                </div>
            </section>

            {/* Hero Section */}
            <section className="pt-8 pb-16 px-4 sm:px-6 lg:px-8 font-ibmm">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="animate-fade-in-up">
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 text-gray-900">
                                Welcome to{' '}
                                <span className="bg-gradient-to-r from-[#00aab0] to-[#007a88] bg-clip-text text-transparent">
                  JALGO.AI
                </span>
                            </h1>
                            <p className="text-lg md:text-xl lg:text-2xl text-gray-800 font-normal max-w-4xl mx-auto mb-10 leading-relaxed">
                                Where Talent Meets Opportunity in an AI-Powered Career Ecosystem
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <button className="bg-gradient-to-r from-[#00aab0] to-[#007a88] text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00aab0] focus-visible:ring-offset-2">
                                    Start Your Journey
                                </button>
                                <button
                                    onClick={() => window.open('https://www.youtube.com/your-video-link', '_blank')}
                                    className="border-2 border-[#005b9a] text-[#005b9a] font-semibold px-8 py-4 rounded-full text-lg hover:bg-[#005b9a] hover:text-white transition-all duration-300 inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005b9a] focus-visible:ring-offset-2"
                                >
                                    <FaYoutube className="!text-red-600" size={24} />
                                    <span>How JALGO.AI Works</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Hero Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            <div className="text-3xl font-bold text-[#005b9a] mb-2">10K+</div>
                            <div className="text-gray-600 font-medium">Active Learners</div>
                        </div>
                        <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            <div className="text-3xl font-bold text-[#005b9a] mb-2">500+</div>
                            <div className="text-gray-600 font-medium">Partner Companies</div>
                        </div>
                        <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            <div className="text-3xl font-bold text-[#005b9a] mb-2">95%</div>
                            <div className="text-gray-600 font-medium">Success Rate</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-8 px-4 sm:px-6 lg:px-8 bg-white font-ibmm">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900">
                            Create Your{' '}
                            <span className="bg-gradient-to-r from-[#00aab0] to-[#007a88] bg-clip-text text-transparent">
                Profile
              </span>
                        </h2>
                        <p className="text-lg md:text-xl lg:text-2xl text-gray-800 font-normal max-w-4xl mx-auto mb-8 leading-relaxed">
                            Connect, post, and grow — just like social media, but purpose-built for learning, networking, and getting hired.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                        <button className="bg-gradient-to-r from-[#00aab0] to-[#007a88] text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00aab0] focus-visible:ring-offset-2">
                            Check out our Public Feed
                        </button>
                    </div>
                </div>
            </section>

            {/* Visual Features Section */}
            <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        <div className="text-center group">
                            <div className="relative overflow-hidden rounded-full border-4 border-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                                <Image
                                    src="/learn_self.jpeg"
                                    alt="Personalized training and skill development at JALGO.AI"
                                    width={400}
                                    height={400}
                                    className="w-full h-auto hover:opacity-90 transition-opacity duration-300"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">Learn & Grow</h3>
                            <p className="text-gray-600">Personalized training and skill development</p>
                        </div>
                        <div className="text-center group">
                            <div className="relative overflow-hidden rounded-full border-4 border-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                                <Image
                                    src="/network.jpeg"
                                    alt="Build professional networks and connect with industry experts at JALGO.AI"
                                    width={400}
                                    height={400}
                                    className="w-full h-auto hover:opacity-90 transition-opacity duration-300"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">Network & Connect</h3>
                            <p className="text-gray-600">Build meaningful professional relationships</p>
                        </div>
                        <div className="text-center group">
                            <div className="relative overflow-hidden rounded-full border-4 border-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                                <Image
                                    src="/hire.jpeg"
                                    alt="Get hired by top companies through AI-powered matching at JALGO.AI"
                                    width={400}
                                    height={400}
                                    className="w-full h-auto hover:opacity-90 transition-opacity duration-300"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">Get Hired</h3>
                            <p className="text-gray-600">AI-powered job matching and career opportunities</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* User Types Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white font-ibmm">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Empowering Every Career Journey
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Whether you're a learner, employer, or educational institution, JALGO provides the tools you need to succeed.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Learners Card */}
                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 transform hover:scale-105">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#00aab0] to-[#007a88] rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Learners</h3>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start space-x-3">
                                    <div className="w-1.5 h-1.5 bg-[#00aab0] rounded-full mt-2 flex-shrink-0"></div>
                                    <span>Get high-quality, personalized training</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <div className="w-1.5 h-1.5 bg-[#00aab0] rounded-full mt-2 flex-shrink-0"></div>
                                    <span>Showcase your work and achievements</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <div className="w-1.5 h-1.5 bg-[#00aab0] rounded-full mt-2 flex-shrink-0"></div>
                                    <span>Build meaningful professional networks</span>
                                </li>
                                <li className="flex items-start space-x-3">
                                    <div className="w-1.5 h-1.5 bg-[#00aab0] rounded-full mt-2 flex-shrink-0"></div>
                                    <span>Get hired by top companies</span>
                                </li>
                            </ul>
                        </div>
                        {/* Employers Card */}
                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 transform hover:scale-105">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#00aab0] to-[#007a88] rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Employers</h3>
                            <div className="space-y-3 text-gray-600">
                                <p className="leading-relaxed">
                                    Post jobs, hire top talent, and build your brand presence — all in one powerful platform designed for modern recruitment.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-start space-x-3">
                                        <div className="w-1.5 h-1.5 bg-[#00aab0] rounded-full mt-2 flex-shrink-0"></div>
                                        <span>AI-powered candidate matching</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="w-1.5 h-1.5 bg-[#00aab0] rounded-full mt-2 flex-shrink-0"></div>
                                        <span>Comprehensive talent pipeline</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {/* Institutions Card */}
                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 transform hover:scale-105">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#00aab0] to-[#007a88] rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Educational Institutions</h3>
                            <div className="space-y-3 text-gray-600">
                                <p className="leading-relaxed">
                                    Deliver impactful training, track learner progress, and scale your outcomes using JALGO's powerful platform and services.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-start space-x-3">
                                        <div className="w-1.5 h-1.5 bg-[#00aab0] rounded-full mt-2 flex-shrink-0"></div>
                                        <span>Advanced analytics & reporting</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <div className="w-1.5 h-1.5 bg-[#00aab0] rounded-full mt-2 flex-shrink-0"></div>
                                        <span>Scalable learning solutions</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r1 font-ibmm rounded-r-4xl">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Career?
                    </h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Join thousands of professionals who are already building their future with JALGO.AI
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-[#00aab0] px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#005b9a]">
                            Get Started Free
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <div className="mt-10 px-0">
                <Footer_W />
            </div>
        </main>
    );
}
