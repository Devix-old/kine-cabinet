'use client'

import Hero from '@/components/SaaS/Hero'
import Footer from '@/components/SaaS/Footer'
import Link from 'next/link'
import Features from '@/components/SaaS/Features'
import Plans from '@/components/SaaS/Plans'
import Testimonials from '@/components/SaaS/Testimonials'

export default function HomePage() {
  return (
    <div className="bg-white">
      <main>
        <Hero />

        {/* Sections composed components */}
        <Features />
                       <Plans />
        <Testimonials />

        {/* CTA Section */}
        <section className="bg-blue-600">
          <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Prêt à transformer votre cabinet ?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
                Rejoignez des centaines de professionnels de santé qui font confiance à notre solution 
                pour gérer leur cabinet plus efficacement.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/auth/register"
                  className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
                >
                  Commencer gratuitement
                </Link>
                <Link
                  href="/contact"
                  className="text-sm font-semibold leading-6 text-white hover:text-blue-100 transition-colors"
                >
                  Contacter l'équipe <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
