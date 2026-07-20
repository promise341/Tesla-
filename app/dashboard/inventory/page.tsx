"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, ShieldAlert, X, SlidersHorizontal, ChevronDown,
  Zap, Bot, BatteryCharging, Package, Star, Tag, TrendingDown,
  TrendingUp, CheckCircle2, ArrowUpDown,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Vehicle Catalogue — with multi-image galleries
───────────────────────────────────────────── */
const VEHICLES = [
  {
    id: "cyber-truck",
    name: "Cyber Truck",
    make: "Tesla",
    type: "EV",
    range: "320 miles",
    acceleration: "0-60 2.6s",
    speed: "130 mph",
    price: 91500.00,
    featured: true,
    stock: 4,
    img: "/images/cars/cybertruck_exterior.png",
    gallery: [
      "/images/cars/cybertruck_exterior.png",
      "/images/cars/cybertruck_interior.png",
    ],
    badge: "New Arrival",
    highlights: ["Exoskeleton Design", "845 hp Cyberbeast", "11,000 lb Towing", "Adaptive Air Suspension"],
  },
  {
    id: "cybercab",
    name: "Tesla Cybercab",
    make: "Tesla",
    type: "EV",
    range: "300 miles",
    acceleration: "0-60 4.0s",
    speed: "110 mph",
    price: 29990.00,
    featured: true,
    stock: 5,
    img: "/images/cars/cybercab_exterior.png",
    gallery: [
      "/images/cars/cybercab_exterior.png",
    ],
    badge: "Robotaxi",
    highlights: ["Full Autonomous Driving", "No Steering Wheel", "Inductive Wireless Charging", "Butterfly Doors"],
  },
  {
    id: "tesla-semi",
    name: "Tesla Semi",
    make: "Tesla",
    type: "EV",
    range: "500 miles",
    acceleration: "0-60 15s",
    speed: "105 mph",
    price: 28500.02,
    featured: true,
    stock: 2,
    img: "/images/cars/semi_exterior.png",
    gallery: [
      "/images/cars/semi_exterior.png",
    ],
    badge: "Fleet Ready",
    highlights: ["500 mi Range Loaded", "3 Rear Drive Motors", "Autopilot Enabled", "Class 8 Heavy Duty"],
  },
  {
    id: "tesla-roadster",
    name: "Tesla Roadster",
    make: "Tesla",
    type: "EV",
    range: "620 miles",
    acceleration: "0-60 1.9s",
    speed: "250+ mph",
    price: 199499.96,
    featured: true,
    stock: 1,
    img: "/images/cars/roadster_exterior.png",
    gallery: [
      "/images/cars/roadster_exterior.png",
    ],
    badge: "Limited Supercar",
    highlights: ["620 mi Range", "0-60 in 1.9s", "SpaceX Thruster Package", "250+ mph Top Speed"],
  },
  {
    id: "tesla-model-x-2",
    name: "Tesla Model X Plaid",
    make: "Tesla",
    type: "EV",
    range: "329 miles",
    acceleration: "0-60 2.5s",
    speed: "149 mph",
    price: 87700.00,
    featured: false,
    stock: 6,
    img: "/images/cars/modelx_falcon_doors.png",
    gallery: [
      "/images/cars/modelx_falcon_doors.png",
    ],
    badge: "Falcon Wing",
    highlights: ["Falcon Wing Doors", "7-Seat Option", "1,020 hp Tri-Motor", "Bioweapon Defence Mode"],
  },
  {
    id: "tesla-model-y",
    name: "Tesla Model Y Performance",
    make: "Tesla",
    type: "EV",
    range: "337 miles",
    acceleration: "0-60 3.5s",
    speed: "155 mph",
    price: 43489.96,
    featured: false,
    stock: 12,
    img: "/images/cars/modely_exterior.png",
    gallery: [
      "/images/cars/modely_exterior.png",
    ],
    badge: "Best Seller",
    highlights: ["76 cu ft Cargo", "337 mi Range", "Dual Motor AWD", "Glass Roof"],
  },
  {
    id: "tesla-model-3-long-range-1",
    name: "Tesla Model 3 Long Range",
    make: "Tesla",
    type: "EV",
    range: "363 miles",
    acceleration: "0-60 4.2s",
    speed: "140 mph",
    price: 42490.00,
    featured: false,
    stock: 9,
    img: "/images/cars/model3_exterior.png",
    gallery: [
      "/images/cars/model3_exterior.png",
    ],
    badge: null,
    highlights: ["363 mi Range", "Dual Motor AWD", "Minimalist Interior", "OTA Updates"],
  },
  {
    id: "tesla-model-s-plaid",
    name: "Tesla Model S Plaid",
    make: "Tesla",
    type: "EV",
    range: "359 miles",
    acceleration: "0-60 1.99s",
    speed: "200 mph",
    price: 89990.00,
    featured: false,
    stock: 3,
    img: "/images/cars/models_exterior.png",
    gallery: [
      "/images/cars/models_exterior.png",
    ],
    badge: "Plaid",
    highlights: ["1,020 hp Tri-Motor", "0-60 in 1.99s", "Yoke Steering Wheel", "Carbon-Sleeved Rotors"],
  },
  {
    id: "tesla-optimus",
    name: "Tesla Optimus Bot",
    make: "Tesla",
    type: "Robot",
    range: "24h Battery",
    acceleration: null,
    speed: "5 mph",
    price: 28998.98,
    featured: false,
    stock: 3,
    img: "/images/cars/optimus_bot.png",
    gallery: [
      "/images/cars/optimus_bot.png",
    ],
    badge: "Pre-Order",
    highlights: ["AI-Powered", "28 DoF Hands", "Tesla FSD Vision", "Factory & Home Assistant"],
  },
  {
    id: "tesla-wall-connector",
    name: "Tesla Wall Connector",
    make: "Tesla",
    type: "Charger",
    range: null,
    acceleration: null,
    speed: "44 mi/hr charge",
    price: 498.97,
    featured: false,
    stock: 50,
    img: "https://teslacapx.com/dash/cars/11/69c40685e0fac.jpg",
    gallery: [
      "https://teslacapx.com/dash/cars/11/69c40685e0fac.jpg",
    ],
    badge: null,
    highlights: ["44 mi/hr Charge Rate", "Wi-Fi Connected", "Works With Any EV", "Easy Install"],
  },
  {
    id: "tesla-powerwall",
    name: "Tesla Powerwall",
    make: "Tesla",
    type: "Battery",
    range: "13.5 kWh",
    acceleration: null,
    speed: null,
    price: 11000.00,
    featured: false,
    stock: 20,
    img: "https://teslacapx.com/dash/cars/10/69c404f5e8dc2.png",
    gallery: [
      "https://teslacapx.com/dash/cars/10/69c404f5e8dc2.png",
    ],
    badge: null,
    highlights: ["13.5 kWh Capacity", "Auto Solar Detect", "Storm Watch Mode", "App Control"],
  },
];

export type Vehicle = typeof VEHICLES[number];

type SortKey = "featured" | "price-asc" | "price-desc" | "stock";
type TypeFilter = "All" | "EV" | "Robot" | "Charger" | "Battery";

/* ─────────────────────────────────────────────
   Type icons + colours
───────────────────────────────────────────── */
function TypeIcon({ type }: { type: string }) {
  if (type === "EV")      return <Zap size={11} />;
  if (type === "Robot")   return <Bot size={11} />;
  if (type === "Charger") return <BatteryCharging size={11} />;
  if (type === "Battery") return <Package size={11} />;
  return <Tag size={11} />;
}

function typeColor(type: string) {
  const map: Record<string, string> = {
    EV:      "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    Robot:   "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    Charger: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    Battery: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
  };
  return map[type] ?? "bg-gray-100 dark:bg-gray-700 text-gray-500";
}

/* ─────────────────────────────────────────────
   Car Card
───────────────────────────────────────────── */
function CarCard({ car }: { car: Vehicle }) {
  const [imgIndex, setImgIndex] = useState(0);
  const lowStock = car.stock <= 3;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group flex flex-col">

      {/* Image area */}
      <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-750">
        <img
          src={car.gallery[imgIndex] ?? car.img}
          alt={car.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { (e.target as HTMLImageElement).src = car.img; }}
        />

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {car.featured && (
            <span className="px-2.5 py-1 bg-primary-500 text-white text-[10px] font-black tracking-wider rounded-md shadow flex items-center gap-1">
              <Star size={9} fill="white" /> FEATURED
            </span>
          )}
          {car.badge && (
            <span className="px-2.5 py-1 bg-black/80 backdrop-blur text-white text-[10px] font-bold rounded-md shadow">
              {car.badge}
            </span>
          )}
        </div>

        {/* Type badge top-right */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold ${typeColor(car.type)}`}>
            <TypeIcon type={car.type} /> {car.type}
          </span>
        </div>

        {/* Gallery dots */}
        {car.gallery.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {car.gallery.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.preventDefault(); setImgIndex(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIndex ? "bg-white w-3" : "bg-white/50"}`}
              />
            ))}
          </div>
        )}

        {/* Stock indicator */}
        <div className={`absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-black backdrop-blur-sm ${lowStock ? "bg-orange-500/90 text-white" : "bg-black/60 text-white"}`}>
          {lowStock ? `Only ${car.stock} left!` : `${car.stock} in stock`}
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-3 leading-snug">{car.name}</h3>

        {/* Specs */}
        <div className="flex items-start gap-4 mb-4 text-xs flex-wrap">
          {car.range && (
            <div>
              <p className="font-extrabold text-primary-500">{car.range}</p>
              <p className="text-gray-400 mt-0.5">Range</p>
            </div>
          )}
          {car.acceleration && (
            <div>
              <p className="font-extrabold text-primary-500">{car.acceleration}</p>
              <p className="text-gray-400 mt-0.5">0-60 mph</p>
            </div>
          )}
          {car.speed && (
            <div>
              <p className="font-extrabold text-primary-500">{car.speed}</p>
              <p className="text-gray-400 mt-0.5">Top Speed</p>
            </div>
          )}
        </div>

        {/* Highlights */}
        {car.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {car.highlights.slice(0, 2).map(h => (
              <span key={h} className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-md">
                <CheckCircle2 size={9} className="text-green-500" /> {h}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="mb-4 mt-auto">
          <p className="text-2xl font-black text-gray-900 dark:text-white">
            ${car.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-gray-400">Starting price · Free delivery</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/dashboard/inventory/${car.id}`}
            className="flex-1 text-center py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Learn More
          </Link>
          <Link
            href={`/dashboard/cars/checkout/${car.id}`}
            className="flex-1 text-center py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-bold transition-colors shadow-md shadow-primary-500/20"
          >
            Order Now
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function InventoryPage() {
  const [search,    setSearch]    = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");
  const [minPrice,  setMinPrice]  = useState("");
  const [maxPrice,  setMaxPrice]  = useState("");
  const [sortKey,   setSortKey]   = useState<SortKey>("featured");
  const [showSort,  setShowSort]  = useState(false);

  const TYPE_TABS: TypeFilter[] = ["All", "EV", "Robot", "Charger", "Battery"];

  const SORT_OPTIONS: { id: SortKey; label: string; icon: React.ReactNode }[] = [
    { id: "featured",   label: "Featured First",    icon: <Star size={13} /> },
    { id: "price-asc",  label: "Price: Low → High", icon: <TrendingUp size={13} /> },
    { id: "price-desc", label: "Price: High → Low", icon: <TrendingDown size={13} /> },
    { id: "stock",      label: "Most In Stock",      icon: <Package size={13} /> },
  ];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = VEHICLES.filter(v => {
      const matchSearch = !q || v.name.toLowerCase().includes(q) || v.type.toLowerCase().includes(q);
      const matchType   = typeFilter === "All" || v.type === typeFilter;
      const matchMin    = minPrice === "" || v.price >= parseFloat(minPrice);
      const matchMax    = maxPrice === "" || v.price <= parseFloat(maxPrice);
      return matchSearch && matchType && matchMin && matchMax;
    });

    list = [...list].sort((a, b) => {
      if (sortKey === "featured")   return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      if (sortKey === "price-asc")  return a.price - b.price;
      if (sortKey === "price-desc") return b.price - a.price;
      if (sortKey === "stock")      return b.stock - a.stock;
      return 0;
    });
    return list;
  }, [search, typeFilter, minPrice, maxPrice, sortKey]);

  const hasFilters = search !== "" || typeFilter !== "All" || minPrice !== "" || maxPrice !== "";
  const currentSort = SORT_OPTIONS.find(s => s.id === sortKey);

  function reset() { setSearch(""); setTypeFilter("All"); setMinPrice(""); setMaxPrice(""); }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white">Available Inventory</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Browse our curated selection of Tesla vehicles & products. Free delivery worldwide.
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 text-xs text-gray-400 flex-wrap">
        {[
          { label: "All Vehicles", count: VEHICLES.length },
          ...["EV", "Robot", "Charger", "Battery"].map(t => ({
            label: t,
            count: VEHICLES.filter(v => v.type === t).length,
          })),
        ].map(s => (
          <span key={s.label}><span className="font-black text-gray-900 dark:text-white">{s.count}</span> {s.label}</span>
        ))}
      </div>

      {/* Search + price filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, type, or model..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          )}
        </div>

        <input
          type="number"
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
          placeholder="Min $"
          className="w-24 px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          type="number"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
          placeholder="Max $"
          className="w-24 px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSort(s => !s)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:border-primary-400 transition-colors"
          >
            <ArrowUpDown size={13} className="text-primary-500" />
            {currentSort?.label}
            <ChevronDown size={12} className={`transition-transform ${showSort ? "rotate-180" : ""}`} />
          </button>
          {showSort && (
            <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 py-1.5 min-w-[180px]">
              {SORT_OPTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSortKey(s.id); setShowSort(false); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-left transition-colors ${sortKey === s.id ? "text-primary-500 bg-red-50 dark:bg-primary-900/20" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {hasFilters && (
          <button onClick={reset} className="text-sm font-bold text-gray-400 hover:text-primary-500 transition-colors px-2 flex items-center gap-1">
            <X size={13} /> Reset
          </button>
        )}
      </div>

      {/* Type filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal size={13} className="text-gray-400" />
        {TYPE_TABS.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
              typeFilter === t
                ? "bg-primary-500 border-primary-500 text-white shadow-sm shadow-primary-500/20"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-500"
            }`}
          >
            {t !== "All" && <TypeIcon type={t} />}
            {t}
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${typeFilter === t ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
              {t === "All" ? VEHICLES.length : VEHICLES.filter(v => v.type === t).length}
            </span>
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Showing <span className="font-black text-gray-900 dark:text-white">{filtered.length}</span> of {VEHICLES.length} vehicles
        </p>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(car => <CarCard key={car.id} car={car} />)}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-16 flex flex-col items-center text-center">
          <ShieldAlert size={36} className="text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="font-extrabold text-gray-900 dark:text-white mb-2">No Vehicles Found</h3>
          <p className="text-sm text-gray-400 mb-5">Try adjusting your search, type filter, or price range.</p>
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
