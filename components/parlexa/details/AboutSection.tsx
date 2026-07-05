'use client';
import { Check, Plug } from 'lucide-react';

interface AboutSectionProps {
  description?: string;
  features?: string[];
  integrations?: string[];
}

export function AboutSection({ description, features = [], integrations = [] }: AboutSectionProps) {
  // Simple "markdown" to HTML helper
  const formatText = (text: string) => {
    if (!text) return '';
    return text
      .split('\n\n')
      .map((para, i) => `<p key="${i}" class="mb-5 leading-relaxed text-white/70">${para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`)
      .join('');
  };

  const filteredIntegrations = integrations.filter(i => i.toLowerCase() !== 'web');

  // Dynamic Grid Logic
  const gridClass = (features.length === 2 || features.length === 4) 
    ? "grid grid-cols-1 sm:grid-cols-2 gap-5"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5";

  return (
    <section>
      {description && (
        <div className="mb-12">
          <h3 className="text-2xl font-extrabold mb-6 text-white">About the Tool</h3>
          <div 
            dangerouslySetInnerHTML={{ __html: formatText(description || '') }} 
            className="text-base"
          />
        </div>
      )}

      {features.length > 0 && (
        <div className="mb-12">
          <h4 className="text-xl font-bold mb-5 text-white">Key Features</h4>
          <ul className={gridClass}>
            {features.map((feature, idx) => (
              <li key={idx} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1">
                <div className="flex flex-col gap-3 p-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-cyan-400/10 p-2 rounded-lg">
                      <Check className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="text-white text-base font-bold">{feature}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {filteredIntegrations.length > 0 && (
        <div className="mb-12">
          <h4 className="text-xl font-bold mb-5 text-white">Integrations</h4>
          <div className="flex flex-wrap gap-3">
            {filteredIntegrations.map((integration, idx) => (
              <div key={idx} className="flex items-center gap-2 px-5 py-3 bg-white/[0.02] rounded-2xl border border-white/5 text-white text-sm font-semibold">
                <Plug className="w-4 h-4 text-cyan-400" />
                {integration}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
