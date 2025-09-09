import Link from 'next/link'
import { motion } from 'framer-motion'
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react'
import EniripsaLogo from './EniripsaLogo'

const navigation = {
  product: [
    { name: 'Fonctionnalités', href: '/features' },
    { name: 'Tarifs', href: '/pricing' },
    { name: 'Démo', href: '/demo' },
    { name: 'API', href: '/api' },
  ],
  company: [
    { name: 'À propos', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Carrières', href: '/careers' },
    { name: 'Contact', href: '/contact' },
  ],
  support: [
    { name: 'Centre d\'aide', href: '/help' },
    { name: 'Documentation', href: '/docs' },
    { name: 'Support', href: '/support' },
    { name: 'Statut', href: '/status' },
  ],
  legal: [
    { name: 'Confidentialité', href: '/privacy' },
    { name: 'Conditions', href: '/terms' },
    { name: 'Cookies', href: '/cookies' },
    { name: 'Licences', href: '/licenses' },
  ],
}

const social = [
  {
    name: 'Facebook',
    href: '#',
    icon: Facebook,
  },
  {
    name: 'Twitter',
    href: '#',
    icon: Twitter,
  },
  {
    name: 'LinkedIn',
    href: '#',
    icon: Linkedin,
  },
  {
    name: 'Instagram',
    href: '#',
    icon: Instagram,
  },
]

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#2F4A5C] via-[#1A2F3A] to-[#0F1B23] relative overflow-hidden" aria-labelledby="footer-heading">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#4CB5B5]/10 to-[#7BC6B5]/8 rounded-full blur-xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#4CB5B5]/8 to-[#DCEEF5]/12 rounded-full blur-lg animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-gradient-to-br from-[#DCEEF5]/6 to-[#4CB5B5]/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
      </div>
      
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32 relative z-10">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <EniripsaLogo className="w-auto h-12" showText={true} />
            </motion.div>
            <motion.p 
              className="text-sm leading-6 text-gray-300 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              La solution complète de gestion pour cabinets de kinésithérapie. Simplifiez votre pratique et améliorez les soins de vos patients.
            </motion.p>
            <motion.div 
              className="flex space-x-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {social.map((item, index) => (
                <motion.div
                  key={item.name}
                  whileHover={{ scale: 1.2, y: -2 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={item.href} className="text-gray-400 hover:text-[#4CB5B5] transition-colors duration-300">
                    <span className="sr-only">{item.name}</span>
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <motion.div 
            className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white mb-6">Produit</h3>
                <ul role="list" className="space-y-4">
                  {navigation.product.map((item, index) => (
                    <motion.li 
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                    >
                      <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-[#4CB5B5] transition-colors duration-300">
                        {item.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white mb-6">Entreprise</h3>
                <ul role="list" className="space-y-4">
                  {navigation.company.map((item, index) => (
                    <motion.li 
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    >
                      <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-[#4CB5B5] transition-colors duration-300">
                        {item.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white mb-6">Support</h3>
                <ul role="list" className="space-y-4">
                  {navigation.support.map((item, index) => (
                    <motion.li 
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    >
                      <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-[#4CB5B5] transition-colors duration-300">
                        {item.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white mb-6">Légal</h3>
                <ul role="list" className="space-y-4">
                  {navigation.legal.map((item, index) => (
                    <motion.li 
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                    >
                      <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-[#4CB5B5] transition-colors duration-300">
                        {item.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Contact Info */}
        <motion.div 
          className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Mail, text: "contact@eniripsa.com", href: "mailto:contact@eniripsa.com" },
              { icon: Phone, text: "+33 1 23 45 67 89", href: "tel:+33123456789" },
              { icon: MapPin, text: "Paris, France", href: "#" }
            ].map((contact, index) => (
              <motion.div 
                key={index}
                className="flex items-center space-x-3 group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#4CB5B5]/20 to-[#3DA4A4]/20 rounded-lg flex items-center justify-center group-hover:from-[#4CB5B5]/30 group-hover:to-[#3DA4A4]/30 transition-all duration-300">
                  <contact.icon className="h-5 w-5 text-[#4CB5B5] group-hover:text-[#3DA4A4] transition-colors duration-300" />
                </div>
                <a href={contact.href} className="text-sm text-gray-300 hover:text-[#4CB5B5] transition-colors duration-300">
                  {contact.text}
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        <motion.div 
          className="mt-8 border-t border-white/10 pt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs leading-5 text-gray-400">
              &copy; 2024 Eniripsa. Tous droits réservés.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link href="/privacy" className="text-xs text-gray-400 hover:text-[#4CB5B5] transition-colors duration-300">
                Confidentialité
              </Link>
              <Link href="/terms" className="text-xs text-gray-400 hover:text-[#4CB5B5] transition-colors duration-300">
                Conditions
              </Link>
              <Link href="/cookies" className="text-xs text-gray-400 hover:text-[#4CB5B5] transition-colors duration-300">
                Cookies
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
} 