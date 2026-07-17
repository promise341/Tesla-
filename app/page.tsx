"use client";

import { useEffect, useState, useRef } from "react";
import { TrendingUp, BarChart3, Wallet, Car, Clock, Gem, Check, UserPlus, Zap, ArrowRight, Shield, Award } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [alertText, setAlertText] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // TradingView Container references
  const hotlistsRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // List of simulated notification texts
  const alerts = [
    "John from New York just withdrew $500",
    "Alice from London just invested $1,000",
    "Michael from Toronto just subscribed to Standard Plan",
    "David from Sydney just purchased a Tesla Roadster",
    "Sophia from Berlin just deposited $2,500 in USDT",
    "Elena from Paris just withdrew $1,200",
    "Tariq from Dubai just invested $15,000",
    "Yusuf from Istanbul just started Beginner Plan"
  ];

  useEffect(() => {
    // Activity alert popup timer
    const showAlertPopup = () => {
      const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
      setAlertText(randomAlert);
      setShowAlert(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 5000);
    };

    // Initial alert and loop
    const initialTimer = setTimeout(showAlertPopup, 5000);
    const intervalTimer = setInterval(showAlertPopup, 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  // Helper: inject a TradingView widget script into a container ref
  function injectTVWidget(
    ref: React.RefObject<HTMLDivElement>,
    src: string,
    config: object
  ) {
    if (!ref.current || ref.current.querySelector("script")) return;
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    script.async = true;
    // textContent is required — innerHTML is stripped/blocked for scripts
    script.textContent = JSON.stringify(config);
    ref.current.appendChild(script);
  }

  useEffect(() => {
    injectTVWidget(hotlistsRef, "https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js", {
      colorTheme: "dark",
      dateRange: "12M",
      exchange: "US",
      showChart: true,
      locale: "en",
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      width: "100%",
      height: "100%",
      plotLineColorGrowing: "rgba(227, 25, 55, 1)",
      plotLineColorFalling: "rgba(227, 25, 55, 1)",
      gridLineColor: "rgba(240, 243, 250, 0)",
      scaleFontColor: "rgba(255, 255, 255, 0.6)",
      belowLineFillColorGrowing: "rgba(227, 25, 55, 0.12)",
      belowLineFillColorFalling: "rgba(227, 25, 55, 0.12)",
      belowLineFillColorGrowingBottom: "rgba(227, 25, 55, 0)",
      belowLineFillColorFallingBottom: "rgba(227, 25, 55, 0)",
      symbolActiveColor: "rgba(227, 25, 55, 0.12)"
    });

    injectTVWidget(overviewRef, "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js", {
      colorTheme: "dark",
      dateRange: "12M",
      showChart: true,
      locale: "en",
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      width: "100%",
      height: "100%",
      tabs: [
        {
          title: "Stocks",
          symbols: [
            { s: "NASDAQ:TSLA", d: "Tesla" },
            { s: "NASDAQ:AAPL", d: "Apple" },
            { s: "NASDAQ:MSFT", d: "Microsoft" },
            { s: "NASDAQ:GOOGL", d: "Alphabet" },
            { s: "NASDAQ:AMZN", d: "Amazon" },
            { s: "NASDAQ:NVDA", d: "Nvidia" }
          ],
          originalTitle: "Stocks"
        }
      ],
      plotLineColorGrowing: "rgba(227, 25, 55, 1)",
      plotLineColorFalling: "rgba(227, 25, 55, 1)",
      gridLineColor: "rgba(240, 243, 250, 0)",
      scaleFontColor: "rgba(255, 255, 255, 0.6)",
      belowLineFillColorGrowing: "rgba(227, 25, 55, 0.12)",
      belowLineFillColorFalling: "rgba(227, 25, 55, 0.12)",
      belowLineFillColorGrowingBottom: "rgba(227, 25, 55, 0)",
      belowLineFillColorFallingBottom: "rgba(227, 25, 55, 0)",
      symbolActiveColor: "rgba(227, 25, 55, 0.12)"
    });

    injectTVWidget(timelineRef, "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js", {
      feedMode: "all_symbols",
      colorTheme: "dark",
      isTransparent: true,
      displayMode: "regular",
      width: "100%",
      height: "100%",
      locale: "en"
    });
  }, []);

  return (
    <div className="relative">
      {/* Dynamic Activity Popup Notification */}
      <div
        className={`fixed bottom-5 left-5 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 z-50 max-w-xs border border-gray-200 dark:border-gray-700 flex items-center space-x-3 transition-all duration-500 transform ${
          showAlert ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{alertText}</span>
      </div>

      {/* Elon Musk Portrait Section */}
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

      {/* Hero Call-To-Action (RED SECTION) */}
      <section className="relative bg-gradient-to-br from-primary-500 to-primary-700 overflow-hidden py-16 lg:py-24 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column Text */}
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white">
                Invest. Trade. Drive.
              </h1>
              <p className="mt-6 text-lg text-white/80 max-w-xl leading-relaxed">
                All-in-one platform for crypto wallet funding, automated investments, live stocks, and premium EV inventory.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/login" className="inline-flex items-center px-6 py-3 bg-white text-primary-600 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg">
                  <TrendingUp className="w-5 h-5 mr-2" /> Start Investing
                </Link>
                <Link href="/cars" className="inline-flex items-center px-6 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 border border-white/30 transition-colors">
                  <Car className="w-5 h-5 mr-2" /> View Inventory
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-4 text-xs font-semibold text-white/90">
                <span className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full border border-white/20">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></div> Live Stocks: <strong className="ml-1">Realtime</strong>
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full border border-white/20">
                  <Wallet className="w-3.5 h-3.5 mr-1.5" /> Wallet: <strong className="ml-1">Crypto</strong>
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full border border-white/20">
                  <Car className="w-3.5 h-3.5 mr-1.5" /> EV Inventory: <strong className="ml-1">Premium</strong>
                </span>
              </div>
            </div>

            {/* Right Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: <TrendingUp className="w-5 h-5 text-white" />, title: "Investments", status: "Automated", desc: "Flexible plans, recurring contributions." },
                { icon: <BarChart3 className="w-5 h-5 text-white" />, title: "Stocks", status: "Realtime", desc: "Quotes, news, and watchlists." },
                { icon: <Wallet className="w-5 h-5 text-white" />, title: "Wallet", status: "Crypto", desc: "Deposit and withdraw easily." },
                { icon: <Car className="w-5 h-5 text-white" />, title: "Marketplace", status: "Tesla", desc: "Curated EV selection." }
              ].map((card, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-3">
                    {card.icon}
                  </div>
                  <h3 className="text-white font-bold">{card.title}</h3>
                  <p className="text-sm text-white/70 mt-0.5">{card.status}</p>
                  <p className="text-xs text-white/50 mt-2">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* SVG Wave Divider Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0,96L80,85.3C160,75,320,53,480,48C640,43,800,53,960,64C1120,75,1280,85,1360,90.7L1440,96L1440,120L0,120Z" className="fill-white"></path>
          </svg>
        </div>
      </section>

      {/* Quick Actions Portal */}
      <section className="bg-white dark:bg-gray-900 py-12 border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: "/login", title: "Wallet", subtitle: "Fund or withdraw", icon: <Wallet className="w-5 h-5 text-primary-500" /> },
              { href: "/login", title: "Investments", subtitle: "Create a plan", icon: <TrendingUp className="w-5 h-5 text-primary-500" /> },
              { href: "/cars", title: "Inventory", subtitle: "Browse vehicles", icon: <Car className="w-5 h-5 text-primary-500" /> },
              { href: "/login", title: "Portfolio", subtitle: "Track performance", icon: <Clock className="w-5 h-5 text-primary-500" /> }
            ].map((action, idx) => (
              <Link key={idx} href={action.href} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-950 dark:text-white group-hover:text-primary-500 transition-colors">{action.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{action.subtitle}</p>
                  </div>
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    {action.icon}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Available Vehicles Section */}
      <section className="bg-primary-50/50 dark:bg-gray-900/40 py-16 lg:py-24 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-950 dark:text-white">Available Inventory</h2>
              <p className="mt-2 text-primary-500 text-sm font-semibold">Explore a curated selection ready for delivery.</p>
            </div>
            <Link href="/cars" className="hidden sm:inline-flex items-center text-sm font-bold text-primary-500 hover:text-primary-600 transition-colors">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { id: "tesla-model-3-long-range-1", name: "Tesla Model 3 Long Range", range: "363 miles", speed: "225 km/h (140 mph)", price: "$42,490.00*", img: "https://teslacapx.com/dash/cars/4/69c29f1b7979e.jpg" },
                { id: "cyber-truck", name: "Cyber Truck", range: "320 miles", speed: "130 mph", price: "$91,500.00*", img: "https://teslacapx.com/dash/cars/5/69c2a1cf16d3c.jpeg" },
                { id: "tesla-model-y", name: "Tesla Model Y", range: "337 miles", speed: "250 km/h", price: "$43,489.96*", img: "https://teslacapx.com/dash/cars/6/69c2cf1617bff.png" },
                { id: "tesla-roadster", name: "Tesla Roadster", range: "620 miles", speed: "250 mph", price: "$199,499.96*", img: "https://teslacapx.com/dash/cars/7/69c3ee94623a4.webp" }
              ].map((car, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group">
                <div className="aspect-[4/3] overflow-hidden relative bg-gray-150 dark:bg-gray-750">
                  <img src={car.img} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-base text-gray-950 dark:text-white leading-snug">{car.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-primary-500 font-semibold">
                    <span>{car.range}</span>
                    <span>{car.speed}</span>
                  </div>
                  <p className="mt-3 text-xs text-gray-400">Starting at</p>
                  <p className="text-lg font-extrabold text-gray-950 dark:text-white leading-none">{car.price}</p>
                  <p className="text-[10px] text-gray-400 mt-1">After Est. Gas Savings</p>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/cars/${car.id}`} className="flex-1 text-center py-2 text-xs font-semibold border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      Learn
                    </Link>
                    <Link href={`/cars/${car.id}`} className="flex-1 text-center py-2 text-xs font-semibold bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                      Order
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Red Wave Separator */}
      <div className="relative h-24 lg:h-36 bg-gradient-to-r from-primary-600 to-primary-800">
        <svg className="absolute top-0 left-0 right-0 w-full" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,0L1440,0L1440,60C1200,20,240,20,0,60Z" className="fill-white dark:fill-gray-900"></path>
        </svg>
        <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,60L1440,60L1440,0C1200,40,240,40,0,0Z" className="fill-gray-900"></path>
        </svg>
      </div>

      {/* Stock Markets Live Widgets */}
      <section id="markets" className="bg-gray-900 py-16 lg:py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-white">Stock Markets</h2>
              <p className="mt-2 text-gray-400 text-sm">Featured picks, top gainers, losers, and most active.</p>
            </div>
            <Link href="/login" className="hidden sm:inline-flex items-center text-sm font-bold text-primary-400 hover:text-primary-300 transition-colors">
              Open markets <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hotlists Widget Container */}
            <div ref={hotlistsRef} className="bg-gray-800/50 rounded-xl border border-gray-850 overflow-hidden" style={{ height: "420px" }}>
              <div className="tradingview-widget-container__widget"></div>
            </div>
            {/* Market Overview Widget Container */}
            <div ref={overviewRef} className="bg-gray-800/50 rounded-xl border border-gray-850 overflow-hidden" style={{ height: "420px" }}>
              <div className="tradingview-widget-container__widget"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Thin red highlight line */}
      <div className="h-2 bg-primary-500"></div>

      {/* Market News Timeline */}
      <section className="bg-white dark:bg-gray-900 py-16 lg:py-24 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-950 dark:text-white">Market News</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm mb-10">Latest headlines impacting your watchlist.</p>
          <div ref={timelineRef} className="bg-gray-900 rounded-xl overflow-hidden" style={{ height: "400px" }}>
            <div className="tradingview-widget-container__widget"></div>
          </div>
        </div>
      </section>

      {/* Investment Plans (PRICING TIERS) */}
      <section id="plans" className="bg-gray-50 dark:bg-gray-850 py-16 lg:py-24 transition-colors border-t border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-950 dark:text-white">Investment Plans</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Choose a plan that fits your financial goals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Test", price: "500$ - 2999$", rate: "" },
              { name: "Beginner Plan", price: "100$ - 25000$", rate: "" },
              { name: "Standard plan", price: "25000$ - 100000$", rate: "" },
              { name: "Business plan", price: "100000$ - 1000000$", rate: "" },
              { name: "Basic Plan", price: "3000$ - 29999$", rate: "" },
              { name: "Stock Starter Plan", price: "100$ - 500$", rate: "" },
              { name: "Stock Growth Plan", price: "500$ - 2000$", rate: "" },
              { name: "Stock Premium Plan", price: "2000$ - 10000$", rate: "" }
            ].map((plan, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all flex flex-col justify-between">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Gem className="w-6 h-6 text-primary-500" />
                  </div>
                  <h3 className="font-extrabold text-lg text-gray-950 dark:text-white">{plan.name}</h3>
                  <div className="mt-2 text-xl font-black text-primary-500">{plan.price}</div>
                  {plan.rate && <p className="text-xs font-bold text-gray-400 mt-1">{plan.rate}</p>}
                </div>
                <ul className="mt-6 space-y-3 text-sm text-gray-500 dark:text-gray-400">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" /> Full access to all instrument types
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" /> All trading assets available
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" /> 24/7 live support
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" /> Full education centre access
                  </li>
                </ul>
                <div className="mt-6">
                  <Link href="/login" className="block w-full text-center py-2.5 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-all shadow-md">
                    Get Started
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="bg-gray-950 py-16 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <p className="text-4xl font-extrabold text-primary-500">89+</p>
              <p className="mt-2 text-sm text-gray-400 font-semibold">Countries Served</p>
              <p className="text-xs text-gray-500 mt-1">Our active clients distribution</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-primary-500">90%</p>
              <p className="mt-2 text-sm text-gray-400 font-semibold">Signal Accuracy</p>
              <p className="text-xs text-gray-500 mt-1">Calculated platform precision</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-primary-500">13K+</p>
              <p className="mt-2 text-sm text-gray-400 font-semibold">Active Followers</p>
              <p className="text-xs text-gray-500 mt-1">Followers counting daily</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-primary-500">10K+</p>
              <p className="mt-2 text-sm text-gray-400 font-semibold">Years Experience</p>
              <p className="text-xs text-gray-500 mt-1">Combined operator expertise</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-900 py-16 lg:py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white">What Our Clients Say</h2>
            <p className="mt-2 text-gray-400 text-sm">Trusted by thousands of investors worldwide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-950 border border-primary-500/20 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mr-4 text-primary-400 font-black text-lg">
                  J
                </div>
                <div>
                  <h4 className="font-bold text-white">James W.</h4>
                  <p className="text-xs text-gray-500">Professional Trader</p>
                </div>
              </div>
              <p className="text-gray-450 italic text-sm">"The platform has transformed the way I manage my investments. The automated plans and real-time stock dashboards are exceptional."</p>
            </div>
            <div className="bg-gray-950 border border-primary-500/20 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mr-4 text-primary-400 font-black text-lg">
                  S
                </div>
                <div>
                  <h4 className="font-bold text-white">Sarah M.</h4>
                  <p className="text-xs text-gray-500">Investor</p>
                </div>
              </div>
              <p className="text-gray-450 italic text-sm">"Outstanding customer support and the vehicle inventory page makes ordering very transparent. I track my yield and assets all in one location."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Account Opening Steps CTA */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-700 py-16 lg:py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Fast account opening in 3 simple steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { num: 1, step: "Register", desc: "Create your free account in minutes" },
              { num: 2, step: "Fund", desc: "Deposit with crypto or wallet transfer" },
              { num: 3, step: "Trade", desc: "Start investing and yield tracking immediately" }
            ].map((s, idx) => (
              <div key={idx} className="text-center">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black text-white border-2 border-white/30">
                  {s.num}
                </div>
                <h3 className="font-bold text-white text-lg">{s.step}</h3>
                <p className="text-sm text-white/70 mt-2">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/register" className="inline-flex items-center px-8 py-3 bg-white text-primary-600 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-xl text-sm">
              <UserPlus className="w-5 h-5 mr-2" /> Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
