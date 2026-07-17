"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, BatteryCharging, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface Vehicle {
  id: string;
  name: string;
  type: string; // EV, Charger, Robot, Battery
  range: string;
  speed: string;
  acceleration?: string;
  price: number;
  featured: boolean;
  img: string;
}

export default function CarsInventory() {
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  const vehicles: Vehicle[] = [
    { id: "tesla-semi", name: "Tesla Semi", type: "EV", range: "500 miles", speed: "105 mph", acceleration: "15s (0-60)", price: 28500.02, featured: true, img: "https://teslacapx.com/dash/cars/13/69c40a3f6c962.jpg" },
    { id: "cyber-truck", name: "Cyber Truck", type: "EV", range: "320 miles", speed: "130 mph", acceleration: "2.6s (0-60)", price: 91500.00, featured: true, img: "https://teslacapx.com/dash/cars/5/69c2a1cf16d3c.jpeg" },
    { id: "tesla-optimus", name: "Tesla Optimus", type: "Robot", range: "24h Battery", speed: "5 mph", price: 28998.98, featured: false, img: "https://teslacapx.com/dash/cars/12/69c407f660122.webp" },
    { id: "tesla-wall-connector", name: "Tesla Wall Connector", type: "Charger", range: "N/A", speed: "44 mi/hr charge", price: 498.97, featured: false, img: "https://teslacapx.com/dash/cars/11/69c40685e0fac.jpg" },
    { id: "tesla-powerwall", name: "Tesla Powerwall", type: "Battery", range: "13.5 kWh capacity", speed: "N/A", price: 11000.00, featured: false, img: "https://teslacapx.com/dash/cars/10/69c404f5e8dc2.png" },
    { id: "tesla-model-x-2", name: "Tesla Model X", type: "EV", range: "329 miles", speed: "149 mph", acceleration: "2.5s (0-60)", price: 87700.00, featured: false, img: "https://teslacapx.com/dash/cars/8/69c3f2cabb77d.jpg" },
    { id: "tesla-roadster", name: "Tesla Roadster", type: "EV", range: "620 miles", speed: "250 mph", acceleration: "1.9s (0-60)", price: 199499.96, featured: false, img: "https://teslacapx.com/dash/cars/7/69c3ee94623a4.webp" },
    { id: "tesla-model-y", name: "Tesla Model Y", type: "EV", range: "337 miles", speed: "250 km/h", acceleration: "3.5s (0-60)", price: 43489.96, featured: false, img: "https://teslacapx.com/dash/cars/6/69c2cf1617bff.png" },
    { id: "tesla-model-3-long-range-1", name: "Tesla Model 3 Long Range", type: "EV", range: "363 miles", speed: "225 km/h (140 mph)", acceleration: "4.2s (0-60)", price: 42490.00, featured: false, img: "https://teslacapx.com/dash/cars/4/69c29f1b7979e.jpg" }
  ];

  const filteredVehicles = vehicles.filter((car) => {
    const matchesSearch = car.name.toLowerCase().includes(search.toLowerCase());
    const matchesMinPrice = minPrice === "" || car.price >= parseFloat(minPrice);
    const matchesMaxPrice = maxPrice === "" || car.price <= parseFloat(maxPrice);
    const matchesType = selectedType === "All" || car.type === selectedType;

    return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Elon Musk Portrait Section (moved from homepage) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center text-center">
        <img
          src="https://www.equilar.com/images/blog/606/blog-tesla-approves-new-award-for-elon-musk.png"
          alt="Elon Musk with Tesla logo"
          className="rounded-xl shadow-2xl max-w-md w-full h-auto mb-6 border border-gray-250 dark:border-gray-800"
        />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Elon Musk</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl text-sm leading-relaxed">
          CEO of Tesla, SpaceX, and visionary entrepreneur. Driving innovation in electric vehicles, space travel, and artificial intelligence technologies.
        </p>
      </section>

      {/* Title Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-950 dark:text-white">Available Inventory</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Browse our curated selection of premium vehicles and energy hardware ready for delivery.</p>
      </div>

      {/* Dynamic Search & Filter Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Text Input */}
          <div className="flex-grow min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
              placeholder="Search by vehicle name, type, or specs..."
            />
          </div>

          {/* Type Select */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="EV">Electric Vehicles</option>
            <option value="Charger">Charging Hardware</option>
            <option value="Battery">Power Batteries</option>
            <option value="Robot">Robotics</option>
          </select>

          {/* Min Price */}
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min Price ($)"
            className="w-32 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />

          {/* Max Price */}
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max Price ($)"
            className="w-32 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />

          {/* Clear Filters */}
          {(search !== "" || minPrice !== "" || maxPrice !== "" || selectedType !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setMinPrice("");
                setMaxPrice("");
                setSelectedType("All");
              }}
              className="text-sm font-semibold text-primary-500 hover:text-primary-600 px-3 py-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Results */}
      {filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((car) => (
            <div key={car.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col justify-between">
              <div>
                {/* Image */}
                <div className="relative overflow-hidden h-48 bg-gray-100 dark:bg-gray-750">
                  <img
                    src={car.img}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  {car.featured && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-primary-500 text-white text-[10px] font-black tracking-wider rounded-md">
                      FEATURED
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-2 leading-snug">{car.name}</h3>

                  {/* Specs */}
                  <div className="flex items-center gap-4 mb-4 text-xs">
                    {car.range !== "N/A" && (
                      <div>
                        <div className="font-extrabold text-primary-500">{car.range}</div>
                        <div className="text-gray-400">Capacity/Range</div>
                      </div>
                    )}
                    {car.acceleration && (
                      <div>
                        <div className="font-extrabold text-primary-500">{car.acceleration}</div>
                        <div className="text-gray-400">Acceleration</div>
                      </div>
                    )}
                    {car.speed !== "N/A" && (
                      <div>
                        <div className="font-extrabold text-primary-500">{car.speed}</div>
                        <div className="text-gray-400">Top Speed</div>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <div className="text-2xl font-black text-gray-950 dark:text-white">
                      ${car.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-gray-400">Starting Retail Price</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 flex gap-2">
                <Link href={`/cars/${car.id}`} className="flex-1 text-center py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-bold">
                  Learn
                </Link>
                <Link href={`/cars/${car.id}`} className="flex-1 text-center py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-xs font-bold shadow-md shadow-primary-500/10">
                  Order Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <ShieldAlert className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Products Found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try tweaking your search term or adjusting the price filters.</p>
        </div>
      )}
    </div>
  );
}
