"use client";

import { motion, useReducedMotion } from 'framer-motion';
import { Flame, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { AgentCard } from '@/components/parlexa/AgentCard';
import { Agent } from '@/lib/types';
import { ScrollReveal } from '@/components/parlexa/ScrollReveal';

export function TrendingSection({ trendingAgents }: { trendingAgents: Agent[] }) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.06 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
  };

  return (
    <section className="bg-[#0A0A0A] py-24">
      <ScrollReveal>
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-semibold text-[#EDEDED] mb-3 tracking-tight flex items-center gap-3">
                <motion.div
                  animate={shouldReduceMotion ? {} : { opacity: [0.7, 1, 0.7], scale: [0.95, 1.05, 0.95] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                >
                  <Flame className="w-8 h-8 text-indigo-500 shrink-0" />
                </motion.div>
                <span>Trending Now</span>
              </h2>
              <p className="text-[#A1A1AA] leading-relaxed text-lg">Most visited and popular AI solutions this week</p>
            </div>
            <Link href="/directory" className="group inline-flex items-center gap-2 bg-[#EDEDED] text-[#0A0A0A] hover:bg-white font-medium rounded-lg px-4 py-2 transition-all text-sm">
              <span>View All Trending</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {trendingAgents.slice(0, 12).map((agent, index) => (
              <motion.div key={agent.id} variants={itemVariants}>
                <AgentCard agent={agent} rank={index + 1} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </ScrollReveal>
    </section>
  );
}
