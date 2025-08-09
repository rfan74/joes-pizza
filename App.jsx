
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, AnimatePresence, LayoutGroup } from "framer-motion";

function useMagnet() {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    setPos({ x: x * 0.15, y: y * 0.15 });
  };
  const onLeave = () => setPos({ x: 0, y: 0 });
  return { ref, pos, onMove, onLeave };
}

function ParallaxStack() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["-20%", "15%"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["-30%", "20%"]);
  return (
    <div ref={ref} className="relative h-[60vh] md:h-[70vh]">
      <motion.div style={{ y: y1 }} className="absolute left-6 top-6 right-24 aspect-[4/3] rounded-3xl overflow-hidden border bg-neutral-200" />
      <motion.div style={{ y: y2 }} className="absolute left-16 top-24 right-12 aspect-[4/3] rounded-3xl overflow-hidden border bg-neutral-200" />
      <motion.div style={{ y: y3 }} className="absolute left-28 top-40 right-0 aspect-[4/3] rounded-3xl overflow-hidden border bg-neutral-200" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-transparent to-red-100/40 rounded-3xl" />
    </div>
  );
}

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [showCart, setShowCart] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 25, mass: 0.3 });

  const heroRef = useRef(null);
  const { scrollYProgress: heroProg } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yHero = useTransform(heroProg, [0, 1], ["0%", "-30%"]);
  const heroOpacity = useTransform(heroProg, [0, 1], [1, 0.6]);
  const heroScale = useTransform(heroProg, [0, 1], [1, 1.08]);

  useEffect(() => {
    const ids = ["home", "menu", "about", "photos", "contact"];
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { threshold: 0.5 });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => setShowCart(v > 0.15));
    return () => unsub();
  }, [scrollYProgress]);

  const magnet = useMagnet();

  const navItems = [
    { label: "Home", href: "#home" },
    { label: "Menu", href: "#menu" },
    { label: "About", href: "#about" },
    { label: "Photos", href: "#photos" },
    { label: "Contact", href: "#contact" },
  ];

  const menu = useMemo(() => [
    { name: "Margherita", desc: "San Marzano, fior di latte, basil", price: "$16", tags: ["V"] },
    { name: "Pepperoni", desc: "Cup & char pepperoni, house mozz", price: "$18", tags: [] },
    { name: "Hot Honey", desc: "Spicy soppressata, chilies, honey", price: "$19", tags: ["🔥"] },
    { name: "Truffle Funghi", desc: "Cremini, porcini oil, pecorino", price: "$20", tags: ["V"] },
    { name: "BBQ Chicken", desc: "BBQ sauce, chicken, red onion", price: "$21", tags: [] },
    { name: "Grandma Slice", desc: "Crisp square, garlicky tomato", price: "$4.75", tags: ["V"] },
  ], []);

  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-red-200 selection:text-red-900">
      <motion.div style={{ scaleX: progress }} className="fixed left-0 right-0 top-0 z-[60] h-1 origin-left bg-red-600" />

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href="#home" className="flex items-center gap-2">
              <span className="font-bold text-lg text-red-600">🍕</span>
              <span className="font-bold text-lg">Joe's Pizza</span>
            </a>
            <nav className="hidden md:flex gap-6 text-sm font-medium">
              {navItems.map((n) => (
                <a key={n.href} href={n.href}
                  className={`relative transition-colors hover:text-red-600 ${active === n.href.replace("#","") ? "text-red-600" : "text-neutral-700"}`}>
                  {n.label}
                  {active === n.href.replace("#","") && (
                    <motion.span layoutId="under" className="absolute -bottom-1 left-0 h-[2px] w-full bg-red-600" />
                  )}
                </a>
              ))}
              <a href="#menu">
                <button ref={magnet.ref} onMouseMove={magnet.onMove} onMouseLeave={magnet.onLeave}
                  className="rounded-full bg-black text-white px-4 py-2">
                  <motion.span animate={{ x: magnet.pos.x, y: magnet.pos.y }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}>
                    Order Now
                  </motion.span>
                </button>
              </a>
            </nav>
            <button className="md:hidden px-3 py-2" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-3 flex flex-col gap-2">
              {navItems.map((n) => (
                <a key={n.href} href={n.href} className="py-2" onClick={() => setMobileOpen(false)}>{n.label}</a>
              ))}
            </div>
          </div>
        )}
      </header>

      <section id="home" className="relative h-[140vh]">
        <div className="sticky top-0 h-screen overflow-hidden" ref={heroRef}>
          <motion.div
            style={{ y: yHero, scale: heroScale, opacity: heroOpacity }}
            className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1541745537413-b804bfa0f7da?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />

          <div className="mx-auto max-w-7xl h-full px-4 sm:px-6 lg:px-8 grid place-items-center text-white text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 rounded-full bg-red-600/90 px-4 py-1 text-xs font-semibold shadow-md">
                NYC Classic • Est. 1998
              </div>
              <h1 className="mt-5 text-5xl sm:text-6xl font-semibold leading-tight drop-shadow">
                Stone‑Fired. Thin Crust. Big Flavor.
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-neutral-100">
                48‑hour cold‑fermented dough, San Marzano tomatoes, and fior di latte. Grab a slice or a whole pie.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <a href="#menu"><button className="rounded-full bg-red-600 hover:bg-red-700 text-white px-5 py-3">View Menu</button></a>
                <a href="#contact" className="inline-flex items-center gap-2 font-medium">Call / Find Us →</a>
              </div>
              <div className="mt-6 flex items-center justify-center gap-4 text-neutral-200 text-sm">
                <span>🔥 Stone‑fired</span>
                <span>🌿 Veg‑friendly</span>
                <span>🚴 Delivery</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="sticky top-16 z-40 border-y bg-amber-50/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 overflow-hidden">
          <div className="flex whitespace-nowrap gap-16 marquee" style={{["--dur"]:"22s"}}>
            {Array.from({ length: 6 }).map((_, i) => (
              <p key={i} className="font-medium">
                🔥 Summer Special: 2 Large Pies + Knots — $29.99 · $1 off slices 3–5pm · Free delivery over $25
              </p>
            ))}
          </div>
        </div>
      </div>

      <section id="menu" className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="sticky top-20 z-10 mb-10 bg-neutral-50/70 backdrop-blur">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Menu Favorites</h2>
            <p className="text-neutral-600">Classic pies, crisp salads, and slice‑shop staples.</p>
          </div>

          <LayoutGroup>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menu.map((item, idx) => (
                <motion.div
                  key={item.name}
                  layout
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ type: "spring", stiffness: 120, damping: 14, delay: idx * 0.05 }}
                  className="group rounded-3xl overflow-hidden border bg-white"
                >
                  <div className="relative aspect-[4/3] bg-neutral-200 overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 200, damping: 18 }}
                    />
                    <motion.div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100" />
                    <motion.span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold">{item.price}</motion.span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-neutral-500">{item.tags.join(" ")}</p>
                    </div>
                    <p className="text-neutral-600 text-sm">{item.desc}</p>
                    <div className="mt-4">
                      <button className="rounded-full bg-black text-white px-3 py-2 text-sm">Add to Order</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </LayoutGroup>
        </div>
      </section>

      <section id="about" className="relative h-[160vh]">
        <div className="sticky top-0 h-screen bg-white">
          <div className="mx-auto max-w-7xl h-full px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Our Story</h2>
              <p className="mt-4 text-neutral-700 max-w-xl">
                Joe opened his first shop in 1998 with a deck oven and a simple mission: do the classics perfectly.
                Our dough ferments for 48 hours; our sauce is San Marzano tomatoes, hand‑crushed; our cheese is fior di latte.
              </p>
              <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm text-neutral-700">
                <li>🔥 Stone‑fired deck ovens</li>
                <li>🌿 Vegetarian‑friendly options</li>
                <li>⭐ Neighborhood favorite</li>
                <li>🚴 Fast delivery</li>
              </ul>
            </div>
            <ParallaxStack />
          </div>
        </div>
      </section>

      <section id="photos" className="py-20 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Gallery</h2>
            <p className="text-neutral-600">Swipe / scroll horizontally</p>
          </div>
          <div className="overflow-x-auto snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-4 min-w-max">
              {[
                "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1974&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2a?q=80&w=1974&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1548365328-9f547fb0950c?q=80&w=1974&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1566843972141-86a47df4fea9?q=80&w=1974&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1974&auto=format&fit=crop",
              ].map((src, i) => (
                <motion.div key={src} whileInView={{ opacity: 1, scale: 1 }} initial={{ opacity: 0.6, scale: 0.98 }}
                  viewport={{ once: false, amount: 0.5 }}
                  className="snap-center shrink-0 w-[80vw] sm:w-[60vw] md:w-[40vw] lg:w-[32vw] overflow-hidden rounded-3xl border">
                  <div className="aspect-[4/3] bg-neutral-200" style={{ backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 items-start">
          <div className="rounded-3xl border bg-white">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">Contact & Catering</h3>
            </div>
            <div className="p-6 space-y-4">
              <form onSubmit={(e) => { e.preventDefault(); alert("Form submitted (demo)"); }} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input placeholder="Your name" required className="border rounded-xl px-3 py-2" />
                  <input type="email" placeholder="Email address" required className="border rounded-xl px-3 py-2" />
                </div>
                <input placeholder="Phone" className="border rounded-xl px-3 py-2" />
                <textarea placeholder="Tell us about your event or question" className="border rounded-xl px-3 py-2 min-h-32" />
                <button type="submit" className="rounded-full bg-black text-white px-4 py-2">Send Message</button>
              </form>
            </div>
          </div>

          <div className="grid gap-4 h-fit">
            <div className="rounded-3xl border bg-white p-6 space-y-3 text-neutral-700 text-sm">
              <div>📞 (555) 987-6543</div>
              <div>✉️ contact@joespizza.com</div>
              <div>📍 456 Pizza Lane, Flavor Town</div>
            </div>
            <div className="rounded-3xl border bg-white p-6">
              <p className="font-medium mb-1">Hours</p>
              <p className="text-sm text-neutral-700">Mon–Thu: 11am–10pm</p>
              <p className="text-sm text-neutral-700">Fri–Sat: 11am–12am</p>
              <p className="text-sm text-neutral-700">Sun: 12pm–9pm</p>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showCart && (
          <motion.button
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className="fixed bottom-6 right-6 z-50 rounded-full border bg-black text-white px-4 py-3 shadow-lg"
          >
            View Order
          </motion.button>
        )}
      </AnimatePresence>

      <footer className="py-12 border-t text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} Joe's Pizza. All rights reserved.
      </footer>
    </div>
  );
}
