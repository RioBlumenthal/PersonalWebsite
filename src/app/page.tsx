import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen pt-4 pl-2 pr-8 pb-20 gap-8 sm:pt-5 sm:pl-4 sm:pr-20 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Sidebar Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 border-4 border-[#89cff0] dark:border-[#0077b6]">
                  <Image
                    src="/headshot.webp"
                    alt="Rio Blumenthal"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rio Blumenthal</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Software Developer</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About Me</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  Hi! I'm an aspiring software developer going for my BS/MS in Computer Science at WPI, and this is my personal showcase site!
Check out my resume and some of my projects, and feel free to reach out to me at rio@blumenthal.com for any questions!
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Education</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 dark:text-blue-300 text-sm">🎓</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">Master of Computer Science</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">Worcester Polytechnic Institute</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">2025-2027</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-300 text-sm">🎓</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">Bachelor of Science</div>
                        <div className="text-gray-600 dark:text-gray-300 text-xs">Computer Science</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">Worcester Polytechnic Institute</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">2023-2026</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contact</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="w-4 h-4 mr-2">📧</span>
                      <span>rio@blumenthal.com</span>
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="w-4 h-4 mr-2">📍</span>
                      <span>Austin, TX and Worcester, MA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              {/* Welcome Section */}
              <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Welcome to My Portfolio
                </h1>
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                  Check out my resume and some of my projects!
                </p>
                <div className="flex gap-4 flex-wrap">
                  <a
                    href="/projects"
                    className="bg-[#89cff0] hover:bg-[#7bb8d9] text-[#171717] px-6 py-3 rounded-lg font-medium transition-colors duration-200 dark:bg-[#0077b6] dark:hover:bg-[#005a8a] dark:text-[#ededed]"
                  >
                    View My Projects
                  </a>
                  <a
                    href="/Resume.pdf"
                    download
                    className="border border-[#89cff0] text-[#89cff0] hover:bg-[#89cff0] hover:text-[#171717] px-6 py-3 rounded-lg font-medium transition-colors duration-200 dark:border-[#0077b6] dark:text-[#0077b6] dark:hover:bg-[#0077b6] dark:hover:text-[#ededed]"
                  >
                    Download Resume
                  </a>
                </div>
              </section>

              {/* Experience */}
              <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Experience
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Software Engineering Intern
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm mb-1">
                        <span>Stealth Power</span>
                        <a 
                          href="https://www.linkedin.com/company/stealth-power/posts/?feedView=all" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                        Developed and maintained Stealth Power dashboard software, and created updated dashboard using Next.js and Auth0 authentication.
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Summer 2025</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Featured Projects Preview */}
              <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Featured Projects
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Project One
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      A brief description of your first featured project and the technologies used.
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">React</span>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">Node.js</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Project Two
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      A brief description of your second featured project and the technologies used.
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded">Next.js</span>
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded">TypeScript</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <a
                    href="/projects"
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    View All Projects →
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
