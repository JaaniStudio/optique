"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  { name: "Sarah K.", text: "Amazing quality! I've been wearing mine every day and they still look brand new. Highly recommend Chashmish." },
  { name: "Ahmed R.", text: "Great selection and fast delivery. The prescription glasses fit perfectly and the customer service was excellent." },
  { name: "Zara M.", text: "Love my new sunglasses! The style is exactly what I was looking for and the price was very reasonable." },
  { name: "Hassan A.", text: "First time ordering online glasses and I'm impressed. The fit was perfect and they arrived sooner than expected." },
  { name: "Ayesha S.", text: "Been a loyal customer for months. Their collection keeps getting better and the quality never disappoints." },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDir(1);
      setCurrent((c) => (c + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  function prev() {
    setDir(-1);
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  }

  function next() {
    setDir(1);
    setCurrent((c) => (c + 1) % testimonials.length);
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0 }),
  };

  return (
    <section className="bg-ink text-cream py-16">
      <div className="mx-auto max-w-3xl px-4 md:px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-10">What Our Customers Say</h2>
        <div className="relative flex items-center justify-center gap-4">
          <button
            onClick={prev}
            className="shrink-0 rounded-full bg-cream/10 p-2 hover:bg-cream/20 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="relative h-40 w-full overflow-hidden flex items-center justify-center">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={current}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute px-4"
              >
                <p className="text-lg text-cream/80 leading-relaxed mb-5">&ldquo;{testimonials[current].text}&rdquo;</p>
                <p className="font-semibold">- {testimonials[current].name}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={next}
            className="shrink-0 rounded-full bg-cream/10 p-2 hover:bg-cream/20 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDir(i > current ? 1 : -1); setCurrent(i); }}
              className={`h-2 rounded-full transition-all ${
                i === current ? "w-6 bg-cream" : "w-2 bg-cream/30"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
