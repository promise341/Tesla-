"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ShoppingCart, ChevronLeft, ChevronRight,
  Share2, Heart, CheckCircle2, Zap, Bot, BatteryCharging,
  Package, Star, Shield, Truck, Clock, Copy, Check,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Full vehicle catalogue with galleries
───────────────────────────────────────────── */
const catalog: Record<string, {
  id: string; name: string; subtitle: string; about: string;
  range: string; speed: string; acceleration: string; hp: string;
  price: number; year: number; color: string; transmission: string;
  type: string; stock: number;
  gallery: string[];
  features: string[];
  specs: { label: string; value: string }[];
}> = {
  "cyber-truck": {
    id: "cyber-truck", name: "Cyber Truck",
    subtitle: "Tesla Cyber Truck 2025 • Metallic Silver • Automatic",
    type: "EV", stock: 4,
    range: "320 miles", speed: "130 mph", acceleration: "0-60 in 2.6s", hp: "845 hp",
    price: 91500, year: 2025, color: "Metallic Silver", transmission: "Automatic",
    gallery: [
      "https://teslacapx.com/dash/cars/5/69c2a1cf16d3c.jpeg",
      "https://images.unsplash.com/photo-1692607038295-d651a294abd0?w=1200&q=85",
      "https://images.unsplash.com/photo-1692607038429-4284c1ca5cff?w=1200&q=85",
      "https://images.unsplash.com/photo-1692360816892-9c4c0e95f97e?w=1200&q=85",
    ],
    about: "The Tesla Cybertruck is a futuristic all-electric pickup truck with ultra-hard 30X cold-rolled stainless steel body. Designed for both heavy-duty work and high performance, it's the most durable exterior of any passenger vehicle ever built, while maintaining incredible utility.",
    features: [
      "Ultra-Hard 30X Stainless Steel Exoskeleton",
      "Up to 800 hp with Cyberbeast powertrain",
      "7,500 lb Towing Capacity",
      "Self-leveling Adaptive Air Suspension",
      "120V & 240V Onboard Power Outlets",
      "Tri-Motor AWD Available",
      "Bulletproof Glass Standard",
      "Autopilot Included",
    ],
    specs: [
      { label: "Range", value: "320 miles" }, { label: "0–60 mph", value: "2.6 sec" },
      { label: "Top Speed", value: "130 mph" }, { label: "Payload", value: "2,500 lbs" },
      { label: "Towing", value: "7,500 lbs" }, { label: "Drive", value: "AWD" },
    ],
  },
  "tesla-model-3-long-range-1": {
    id: "tesla-model-3-long-range-1", name: "Tesla Model 3 Long Range",
    subtitle: "Tesla Model 3 Long Range 2025 • Deep Blue Metallic • Automatic",
    type: "EV", stock: 9,
    range: "363 miles", speed: "140 mph", acceleration: "0-60 in 4.2s", hp: "394 hp",
    price: 42490, year: 2025, color: "Deep Blue Metallic", transmission: "Automatic",
    gallery: [
      "https://teslacapx.com/dash/cars/4/69c29f1b7979e.jpg",
      "https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=1200&q=85",
      "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=1200&q=85",
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1200&q=85",
    ],
    about: "Model 3 Long Range is designed for maximum efficiency with dual motor AWD, quick acceleration, long range, and fast charging. The most popular Tesla ever made, combining sleek design with practical everyday usability.",
    features: [
      "363 Miles EPA-Rated Range",
      "Dual Motor All-Wheel Drive",
      "Over-The-Air Software Updates",
      "15.4\" Cinematic Touchscreen",
      "Autopilot Standard",
      "Premium Audio System",
      "Glass Roof Standard",
      "Wireless Charging Pad",
    ],
    specs: [
      { label: "Range", value: "363 miles" }, { label: "0–60 mph", value: "4.2 sec" },
      { label: "Top Speed", value: "140 mph" }, { label: "Horsepower", value: "394 hp" },
      { label: "Drive", value: "AWD" }, { label: "Seats", value: "5" },
    ],
  },
  "tesla-model-y": {
    id: "tesla-model-y", name: "Tesla Model Y",
    subtitle: "Tesla Model Y 2025 • Solid Black • Automatic",
    type: "EV", stock: 12,
    range: "337 miles", speed: "155 mph", acceleration: "0-60 in 3.5s", hp: "456 hp",
    price: 43489, year: 2025, color: "Solid Black", transmission: "Automatic",
    gallery: [
      "https://teslacapx.com/dash/cars/6/69c2cf1617bff.png",
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=1200&q=85",
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=85",
      "https://images.unsplash.com/photo-1617651823081-270acf1ad775?w=1200&q=85",
    ],
    about: "Model Y provides maximum versatility — able to carry 7 passengers and their gear in a spacious SUV body. Dual motor all-wheel drive with maximum range. The best-selling electric vehicle in history.",
    features: [
      "Optional 7-Seat Configuration",
      "337 Miles EPA Range",
      "456 hp Dual Motor AWD",
      "Panoramic Glass Roof",
      "15.4\" Center Touchscreen",
      "Autopilot Included",
      "70+ Cu Ft Cargo Space",
      "Dog Mode & Camp Mode",
    ],
    specs: [
      { label: "Range", value: "337 miles" }, { label: "0–60 mph", value: "3.5 sec" },
      { label: "Top Speed", value: "155 mph" }, { label: "Horsepower", value: "456 hp" },
      { label: "Seats", value: "5 / 7" }, { label: "Cargo", value: "70+ cu ft" },
    ],
  },
  "tesla-roadster": {
    id: "tesla-roadster", name: "Tesla Roadster",
    subtitle: "Tesla Roadster Supercar 2026 • Roadster Red • Automatic",
    type: "EV", stock: 1,
    range: "620 miles", speed: "250+ mph", acceleration: "0-60 in 1.9s", hp: "1,200 hp",
    price: 199499, year: 2026, color: "Roadster Red", transmission: "Automatic",
    gallery: [
      "https://teslacapx.com/dash/cars/7/69c3ee94623a4.webp",
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&q=85",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85",
      "https://images.unsplash.com/photo-1617650728517-bb5fab83c2a4?w=1200&q=85",
    ],
    about: "An all-electric supercar maximizing aerodynamic engineering with record-setting acceleration, range, and high-performance design. The fastest production car ever made, with the world's longest electric vehicle range.",
    features: [
      "620 Miles Range — World Record",
      "0–60 mph in 1.9 seconds",
      "250+ mph Top Speed",
      "SpaceX Thruster Package Option",
      "1,200+ hp Tri-Motor AWD",
      "Removable Glass Roof",
      "Extreme Aerodynamic Design",
      "10,000 N·m Peak Torque",
    ],
    specs: [
      { label: "Range", value: "620 miles" }, { label: "0–60 mph", value: "1.9 sec" },
      { label: "Top Speed", value: "250+ mph" }, { label: "Horsepower", value: "1,200+ hp" },
      { label: "Torque", value: "10,000 N·m" }, { label: "Drive", value: "Tri-Motor AWD" },
    ],
  },
  "tesla-semi": {
    id: "tesla-semi", name: "Tesla Semi",
    subtitle: "Tesla Semi Truck 2026 • Arctic White • Automatic",
    type: "EV", stock: 2,
    range: "500 miles", speed: "105 mph", acceleration: "0-60 in 15s (loaded)", hp: "1,020 hp",
    price: 28500, year: 2026, color: "Arctic White", transmission: "Automatic",
    gallery: [
      "https://teslacapx.com/dash/cars/13/69c40a3f6c962.jpg",
      "https://images.unsplash.com/photo-1666518533540-2c79ccad21e3?w=1200&q=85",
      "https://images.unsplash.com/photo-1666518533399-3f4f45bdb75c?w=1200&q=85",
    ],
    about: "The Tesla Semi is a Class 8 electric truck designed for maximum safety, efficiency, and heavy-cargo hauling. Powered by three independent motors on the rear axles, it delivers the lowest energy cost per mile of any commercial truck.",
    features: [
      "500 Mile Range with Full Cargo",
      "3 Independent Rear Drive Motors",
      "Enhanced Autopilot for Trucking",
      "Lowest Center of Gravity in Class",
      "Regenerative Braking Never Needs Pad Replacement",
      "360° Camera Safety System",
      "Mega-charger Compatible",
      "80,000 lb GVWR Rated",
    ],
    specs: [
      { label: "Range", value: "500 miles" }, { label: "0–60 mph", value: "15 sec" },
      { label: "Top Speed", value: "105 mph" }, { label: "Horsepower", value: "1,020 hp" },
      { label: "GVWR", value: "80,000 lbs" }, { label: "Motors", value: "3x Rear" },
    ],
  },
  "tesla-model-x-2": {
    id: "tesla-model-x-2", name: "Tesla Model X",
    subtitle: "Tesla Model X 2025 • Pearl White Multi-Coat • Automatic",
    type: "EV", stock: 6,
    range: "329 miles", speed: "149 mph", acceleration: "0-60 in 2.5s", hp: "1,020 hp",
    price: 87700, year: 2025, color: "Pearl White Multi-Coat", transmission: "Automatic",
    gallery: [
      "https://teslacapx.com/dash/cars/8/69c3f2cabb77d.jpg",
      "https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=1200&q=85",
      "https://images.unsplash.com/photo-1572635148818-ef6fd45eb394?w=1200&q=85",
      "https://images.unsplash.com/photo-1561171200-99ef5b80b68c?w=1200&q=85",
    ],
    about: "Tesla Model X has the highest power and fastest acceleration of any SUV, featuring iconic Falcon Wing doors and premium interior. Perfect for families who refuse to compromise on performance.",
    features: [
      "Iconic Falcon Wing Rear Doors",
      "1,020 hp Tri-Motor AWD",
      "6–7 Passenger Seating",
      "329 Miles Range",
      "Bioweapon Defence Mode HEPA Filter",
      "22-Speaker Premium Audio",
      "17\" Front + 8\" Rear Screens",
      "Autopilot Included",
    ],
    specs: [
      { label: "Range", value: "329 miles" }, { label: "0–60 mph", value: "2.5 sec" },
      { label: "Top Speed", value: "149 mph" }, { label: "Horsepower", value: "1,020 hp" },
      { label: "Seats", value: "5–7" }, { label: "Drive", value: "Tri-Motor AWD" },
    ],
  },
  "tesla-optimus": {
    id: "tesla-optimus", name: "Tesla Optimus",
    subtitle: "Tesla Optimus Humanoid Robot 2025 • Matte Black & White",
    type: "Robot", stock: 3,
    range: "24h Battery", speed: "5 mph", acceleration: "N/A", hp: "N/A",
    price: 28998.98, year: 2025, color: "Matte Black & White", transmission: "Robotic Joint Actuators",
    gallery: [
      "https://teslacapx.com/dash/cars/12/69c407f660122.webp",
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=85",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=85",
    ],
    about: "Optimus is a general-purpose, bi-pedal humanoid robot capable of performing tasks that are unsafe, repetitive, or boring. Designed for factory and home use, it leverages Tesla's FSD AI and computer vision from real-world Tesla fleet data.",
    features: [
      "28 Degrees of Freedom in Hands",
      "Tesla FSD Computer Brain",
      "AI Object Recognition",
      "24-Hour Battery Life",
      "Self-Learning Capabilities",
      "5 mph Walking Speed",
      "OTA Firmware Updates",
      "Factory & Home Task Capable",
    ],
    specs: [
      { label: "Battery Life", value: "24 hours" }, { label: "Walk Speed", value: "5 mph" },
      { label: "Hand DOF", value: "28" }, { label: "AI", value: "Tesla FSD" },
      { label: "Height", value: "5\'8\"" }, { label: "Weight", value: "125 lbs" },
    ],
  },
  "tesla-wall-connector": {
    id: "tesla-wall-connector", name: "Tesla Wall Connector",
    subtitle: "Tesla Wall Connector Charger 2025 • Metallic Silver",
    type: "Charger", stock: 50,
    range: "44 mi/hr charge", speed: "N/A", acceleration: "N/A", hp: "11.5 kW max output",
    price: 498.97, year: 2025, color: "Metallic Silver", transmission: "N/A",
    gallery: [
      "https://teslacapx.com/dash/cars/11/69c40685e0fac.jpg",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85",
    ],
    about: "Wall Connector is Tesla's most convenient home charging solution for Tesla and non-Tesla electric vehicles. Wi-Fi connected for energy management and OTA updates. Ideal for residential and commercial installations.",
    features: [
      "44 Miles of Range Added Per Hour",
      "Wi-Fi Connected OTA Updates",
      "Universal J1772 Adapter Included",
      "Works With Any EV (Not Just Tesla)",
      "5-Year Limited Warranty",
      "Indoor & Outdoor Rated",
      "App-Based Scheduling",
      "11.5 kW Max Output",
    ],
    specs: [
      { label: "Charge Rate", value: "44 mi/hr" }, { label: "Output", value: "11.5 kW" },
      { label: "Voltage", value: "240V" }, { label: "Amperage", value: "48A max" },
      { label: "Cable", value: "18 ft" }, { label: "Warranty", value: "5 Years" },
    ],
  },
  "tesla-powerwall": {
    id: "tesla-powerwall", name: "Tesla Powerwall",
    subtitle: "Tesla Powerwall 3 2025 • Classic White",
    type: "Battery", stock: 20,
    range: "13.5 kWh Capacity", speed: "N/A", acceleration: "N/A", hp: "5 kW continuous",
    price: 11000, year: 2025, color: "Classic White", transmission: "N/A",
    gallery: [
      "https://teslacapx.com/dash/cars/10/69c404f5e8dc2.png",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85",
    ],
    about: "Powerwall is an integrated battery system that stores solar energy for backup protection. It detects outages automatically and recharges with sunlight to keep your home powered 24/7 during grid outages.",
    features: [
      "13.5 kWh Usable Capacity",
      "Automatic Outage Detection",
      "Solar Recharging Support",
      "Storm Watch Mode",
      "Time-Based Control",
      "Tesla App Integration",
      "10-Year Warranty",
      "Indoor & Outdoor Install",
    ],
    specs: [
      { label: "Capacity", value: "13.5 kWh" }, { label: "Power", value: "5 kW continuous" },
      { label: "Peak", value: "10 kW" }, { label: "Efficiency", value: "90%" },
      { label: "Warranty", value: "10 Years" }, { label: "Depth", value: "100% DoD" },
    ],
  },
};

function typeIcon(type: string) {
  if (type === "EV")      return <Zap size={14} />;
  if (type === "Robot")   return <Bot size={14} />;
  if (type === "Charger") return <BatteryCharging size={14} />;
  if (type === "Battery") return <Package size={14} />;
  return null;
}

/* ─────────────────────────────────────────────
   Gallery Component
───────────────────────────────────────────── */
function Gallery({ images, name, hasVideo, videoSrc }: {
  images: string[]; name: string; hasVideo?: boolean; videoSrc?: string;
}) {
  const [active, setActive] = useState(0);
  const total = images.length;

  const prev = () => setActive(i => (i - 1 + total) % total);
  const next = () => setActive(i => (i + 1) % total);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800 h-64 md:h-[380px] bg-gray-900">
        {hasVideo && active === 0 && videoSrc ? (
          <video src={videoSrc} autoPlay loop muted playsInline className="w-full h-full object-cover" />
        ) : (
          <img
            src={images[active]}
            alt={`${name} — photo ${active + 1}`}
            className="w-full h-full object-cover transition-opacity duration-300"
            onError={e => { (e.target as HTMLImageElement).src = images[0]; }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Prev / Next arrows */}
        {total > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all">
              <ChevronLeft size={18} />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all">
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Photo count */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur text-white text-[10px] font-bold rounded-full">
          {active + 1} / {total}
        </div>
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === active ? "border-primary-500 shadow-md shadow-primary-500/20" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = images[0]; }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function DashboardCarDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const id       = (params?.id as string) ?? "";
  const car      = catalog[id] ?? null;
  const [saved,  setSaved]  = useState(false);
  const [copied, setCopied] = useState(false);

  if (!car) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <ArrowLeft size={28} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Vehicle Not Found</h2>
        <p className="text-sm text-gray-400">The vehicle you're looking for doesn't exist in our catalogue.</p>
        <Link href="/dashboard/inventory" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-colors">
          <ArrowLeft size={14} /> Back to Inventory
        </Link>
      </div>
    );
  }

  const related  = Object.values(catalog).filter(c => c.id !== car.id && c.type === car.type).slice(0, 4);
  const lowStock = car.stock <= 3;

  const videoMap: Record<string, string> = {
    "cyber-truck":                "/cyber.mp4",
    "tesla-model-3-long-range-1": "/model .mp4",
    "tesla-model-y":              "/model y.mp4",
  };
  const hasVideo = !!videoMap[car.id];

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Back + breadcrumb */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/inventory" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-primary-500 transition-colors">
          <ArrowLeft size={15} /> Back to Inventory
        </Link>
        <div className="flex items-center gap-2">
          {/* Wishlist */}
          <button
            onClick={() => setSaved(s => !s)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border rounded-xl transition-all ${saved ? "border-red-300 bg-red-50 dark:bg-red-900/20 text-red-500" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-red-300 hover:text-red-500"}`}
          >
            <Heart size={13} className={saved ? "fill-red-500 text-red-500" : ""} />
            {saved ? "Saved" : "Save"}
          </button>
          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-gray-200 dark:border-gray-700 text-gray-500 hover:border-primary-400 hover:text-primary-500 rounded-xl transition-all"
          >
            {copied ? <Check size={13} className="text-green-500" /> : <Share2 size={13} />}
            {copied ? "Copied!" : "Share"}
          </button>
        </div>
      </div>

      {/* Title + type */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
              car.type === "EV" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" :
              car.type === "Robot" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600" :
              car.type === "Charger" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" :
              "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"
            }`}>
              {typeIcon(car.type)} {car.type}
            </span>
            {lowStock && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 text-xs font-bold rounded-lg animate-pulse">
                ⚡ Only {car.stock} left!
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{car.name}</h1>
          <p className="text-sm text-gray-400 mt-1">{car.subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-gray-900 dark:text-white">
            ${car.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Starting price · Free delivery</p>
        </div>
      </div>

      {/* Gallery + right panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Gallery + details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Gallery */}
          <Gallery
            images={car.gallery}
            name={car.name}
            hasVideo={hasVideo}
            videoSrc={videoMap[car.id]}
          />

          {/* Quick specs bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {car.specs.map(s => (
              <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-center">
                <p className="text-base font-black text-primary-500">{s.value}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* About */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="font-extrabold text-gray-900 dark:text-white mb-3">About This Vehicle</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{car.about}</p>
          </div>

          {/* Features list */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="font-extrabold text-gray-900 dark:text-white mb-4">Key Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {car.features.map(f => (
                <div key={f} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Shield size={20} className="text-green-500" />, label: "5-Year Warranty", sub: "Full manufacturer cover" },
              { icon: <Truck size={20} className="text-blue-500" />,   label: "Free Delivery",  sub: "Worldwide shipping" },
              { icon: <Clock size={20} className="text-orange-500" />, label: "Quick Processing", sub: "Order confirmed in 24h" },
            ].map(b => (
              <div key={b.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                <div className="flex justify-center mb-2">{b.icon}</div>
                <p className="text-xs font-black text-gray-900 dark:text-white">{b.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Order panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm sticky top-6">
            <h2 className="font-extrabold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">Order Details</h2>

            <div className="space-y-3 mb-5">
              {[
                { label: "Price",         value: `$${car.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, cls: "font-extrabold text-gray-900 dark:text-white" },
                { label: "Year",          value: String(car.year), cls: "" },
                { label: "Color",         value: car.color, cls: "" },
                { label: "Transmission",  value: car.transmission, cls: "" },
                { label: "Availability",  value: lowStock ? `Only ${car.stock} left!` : "In Stock", cls: lowStock ? "text-orange-500 font-bold" : "text-green-500 font-bold" },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm border-b border-gray-50 dark:border-gray-700 pb-2 last:border-0">
                  <span className="text-gray-400 text-xs">{r.label}</span>
                  <span className={`text-xs ${r.cls || "font-semibold text-gray-700 dark:text-gray-300"}`}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* Payment methods preview */}
            <div className="mb-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Payment Options</p>
              <div className="flex flex-wrap gap-1.5">
                {["Balance", "BTC", "ETH", "USDT", "BNB", "SOL"].map(m => (
                  <span key={m} className="px-2 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-[10px] font-bold text-gray-600 dark:text-gray-400 rounded-lg">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Order button */}
            <button
              onClick={() => router.push(`/dashboard/cars/checkout/${car.id}`)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-sm rounded-xl transition-colors shadow-md shadow-primary-500/20"
            >
              <ShoppingCart size={15} /> Order Now — ${car.price.toLocaleString()}
            </button>

            <p className="text-[10px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
              <Shield size={10} className="text-green-500" /> Secure checkout · Verified payment · Free delivery
            </p>

            {/* Ratings */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-[10px] text-gray-400">4.9/5 · 2,400+ happy customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related vehicles */}
      {related.length > 0 && (
        <div>
          <h3 className="font-extrabold text-gray-900 dark:text-white mb-4">Related {car.type === "EV" ? "Vehicles" : "Products"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map(rc => (
              <Link key={rc.id} href={`/dashboard/inventory/${rc.id}`}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <div className="h-28 overflow-hidden">
                  <img src={rc.gallery[0]} alt={rc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => { (e.target as HTMLImageElement).src = rc.gallery[0]; }} />
                </div>
                <div className="p-3">
                  <p className="font-bold text-xs text-gray-900 dark:text-white leading-snug">{rc.name}</p>
                  <p className="text-xs text-primary-500 font-black mt-0.5">${rc.price.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{rc.stock > 3 ? "In Stock" : `${rc.stock} left`}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
