'use client';

export default function Careers() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] selection:bg-white/[0.08] selection:text-[#EDEDED] py-24 px-6 sm:px-12">
      <article className="max-w-3xl mx-auto">
        <header className="mb-16 border-b border-white/[0.08] pb-10">
          <h1 className="text-[#EDEDED] text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Careers at Parlexa
          </h1>
          <p className="text-[#71717A] text-sm uppercase tracking-widest">
            Join Our Team
          </p>
        </header>
        <div className="space-y-12">
          <section>
            <p className="text-[#A1A1AA] leading-relaxed mb-4">
              We are building the infrastructure for the next generation of AI adoption. While we don't have any open positions listed at this exact moment, we are always looking for exceptional engineers, designers, and growth experts to join us.
            </p>
            <p className="text-[#A1A1AA] leading-relaxed">
              If you think you'd be a great fit, feel free to send your resume and a brief introduction to <a href="mailto:careers@parlexa.in" className="text-[#EDEDED] hover:text-white transition-colors">careers@parlexa.in</a>.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
