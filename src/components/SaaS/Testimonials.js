"use client";

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { testimonials } from '@/lib/data';

const Testimonials = () => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-24 bg-gradient-to-br from-[#FBFBFB] via-[#F8FBFD] to-[#E6F1F7] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-[#4CB5B5]/8 to-[#7BC6B5]/6 rounded-full blur-xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-40 left-20 w-24 h-24 bg-gradient-to-br from-[#4CB5B5]/6 to-[#DCEEF5]/10 rounded-full blur-lg animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute bottom-32 right-20 w-40 h-40 bg-gradient-to-br from-[#DCEEF5]/4 to-[#4CB5B5]/8 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-2 bg-[#DCEEF5]/30 border border-[#4CB5B5]/20 text-[#2F4A5C] text-sm font-medium rounded-full mb-6"
          >
            <span className="w-2 h-2 bg-[#4CB5B5] rounded-full mr-2 inline-block"></span>
            Témoignages Clients
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[#2F4A5C] via-[#4CB5B5] to-[#2F4A5C] bg-clip-text text-transparent mb-6"
            style={{ backgroundSize: "200% 200%" }}
          >
            Fait confiance par les cabinets
            <br />
            <span className="text-[#4CB5B5]">du monde entier</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-[#3A5166] max-w-3xl mx-auto leading-relaxed"
          >
            Découvrez comment <span className="text-[#4CB5B5] font-semibold">Eniripsa</span> a transformé 
            la gestion de leur cabinet de kinésithérapie.
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative p-8 bg-white/80 backdrop-blur-sm rounded-3xl border border-[#DCEEF5] hover:shadow-2xl hover:shadow-[#4CB5B5]/10 transition-all duration-500"
            >
              {/* Quote Icon */}
              <motion.div 
                className="absolute -top-4 left-8"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#4CB5B5] to-[#3DA4A4] rounded-full flex items-center justify-center shadow-lg">
                  <Quote className="w-5 h-5 text-white" />
                </div>
              </motion.div>

              {/* Rating */}
              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  {renderStars(testimonial.rating)}
                </div>
                <span className="ml-3 text-sm text-[#3A5166] font-medium">
                  {testimonial.rating}/5
                </span>
              </div>

              {/* Content */}
              <blockquote className="text-[#2F4A5C] mb-8 leading-relaxed text-lg">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <motion.div 
                  className="w-14 h-14 bg-gradient-to-br from-[#4CB5B5] to-[#3DA4A4] rounded-2xl flex items-center justify-center mr-4 shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-white font-bold text-lg">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </motion.div>
                <div>
                  <div className="font-bold text-[#2F4A5C] text-lg">
                    {testimonial.name}
                  </div>
                  <div className="text-[#3A5166] font-medium">
                    {testimonial.role}
                  </div>
                  <div className="text-[#4CB5B5] font-semibold">
                    {testimonial.clinic}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-8"
        >
          {[
            { number: "500+", label: "Cabinets Actifs", icon: "🏥" },
            { number: "50K+", label: "Patients Gérés", icon: "👥" },
            { number: "99.9%", label: "Disponibilité", icon: "⚡" },
            { number: "4.9/5", label: "Note Clients", icon: "⭐" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-3xl border border-[#DCEEF5] hover:shadow-lg hover:shadow-[#4CB5B5]/10 transition-all duration-300"
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-[#4CB5B5] to-[#3DA4A4] bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-[#3A5166] font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials; 