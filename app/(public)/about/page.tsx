import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] selection:bg-white/[0.08] selection:text-[#EDEDED] py-24 px-6 sm:px-12">
      <article className="max-w-3xl mx-auto">
        <header className="mb-16 border-b border-white/[0.08] pb-10">
          <h1 className="text-[#EDEDED] text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            About Parlexa
          </h1>
          <p className="text-[#A1A1AA] text-lg leading-relaxed">
            Empowering the next generation of enterprises through autonomous AI integration.
          </p>
        </header>

        <div className="space-y-12">
          <section>
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4">
              Our Mission
            </h2>
            <p className="text-[#A1A1AA] leading-relaxed mb-4">
              At Parlexa, we believe that the barrier to entry for robust, enterprise-grade AI should be eliminated. 
              Our mission is to construct the ultimate directory of AI agents—ranging from customer support LLMs to 
              complex vertical data analysis models—and connect builders globally with the businesses that need them.
            </p>
            <p className="text-[#A1A1AA] leading-relaxed">
              Whether you're a small startup trying to scale your operations autonomously or a Fortune 500 company 
              transitioning into the generative era, Parlexa provides a vetted, intuitive marketplace to discover 
              exactly what you need.
            </p>
          </section>

          <section>
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4">
              Why We Built This
            </h2>
            <p className="text-[#A1A1AA] leading-relaxed mb-4">
              The AI landscape is fragmented. Finding reliable, secure, and production-ready AI agents is a daunting 
              task hidden behind endless vendor documentation and generic software lists.
            </p>
            <p className="text-[#A1A1AA] leading-relaxed">
              We engineered Parlexa's proprietary AI matching engine to strip away the noise. By structuring 
              capabilities, pricing, and integrations transparently, we streamline the procurement process, helping 
              you architect the perfect software stack in seconds.
            </p>
          </section>

          <section className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8 md:p-12 text-center mt-16">
            <h2 className="text-[#EDEDED] text-2xl font-semibold tracking-tight mb-4">
              Join the Ecosystem
            </h2>
            <p className="text-[#A1A1AA] leading-relaxed mb-8 max-w-lg mx-auto">
              Ready to explore the marketplace or list your own proprietary agent?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/products" className="px-6 py-3 bg-[#EDEDED] text-[#0A0A0A] font-medium rounded-lg hover:bg-white transition-colors w-full sm:w-auto">
                Explore AI Agents
              </Link>
              <Link href="/dashboard/vendor/listings/new" className="px-6 py-3 bg-transparent border border-white/[0.08] text-[#EDEDED] font-medium rounded-lg hover:bg-white/[0.04] transition-colors w-full sm:w-auto">
                List Your Tool
              </Link>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}
