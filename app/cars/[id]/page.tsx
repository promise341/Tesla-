"use client";

import { useParams } from "next/navigation";
import { ArrowLeft, Check, LogIn } from "lucide-react";
import Link from "next/link";

interface VehicleDetails {
  id: string;
  name: string;
  subtitle: string;
  range: string;
  speed: string;
  acceleration: string;
  hp: string;
  price: number;
  year: number;
  color: string;
  transmission: string;
  about: string;
  img: string;
}

export default function CarDetailPage() {
  const params = useParams();
  const id = (params?.id as string) ?? "";

  const catalog: Record<string, VehicleDetails> = {
    "cyber-truck": {
      id: "cyber-truck",
      name: "Cyber Truck",
      subtitle: "Tesla Cyber Truck 2025 • Metallic Silver",
      range: "320 miles Range",
      speed: "130 mph Top Speed",
      acceleration: "0-60 in 2.6s",
      hp: "845 hp",
      price: 91500.00,
      year: 2025,
      color: "Metallic Silver",
      transmission: "Automatic",
      img: "https://teslacapx.com/dash/cars/5/69c2a1cf16d3c.jpeg",
      about: `🚛 OVERVIEW
The Tesla Cybertruck represents a revolutionary approach to electric pickup trucks, combining ultra-hard 30X cold-rolled stainless steel exoskeleton with all-electric performance. The Cyberbeast variant delivers 845 horsepower from its tri-motor powertrain, accelerating 0-60 mph in just 2.6 seconds while maintaining an 11,000 lbs towing capacity.

🔋 BATTERY & RANGE
• Capacity: 123 kWh battery pack with advanced 4680 structural cells
• Range: 320-340 miles EPA estimated depending on configuration
• Charging: 135 miles of range added in just 15 minutes via Tesla Supercharger network (325kW maximum charging speed)
• Efficiency: Advanced battery thermal management system ensures optimal performance in extreme temperatures from desert heat to freezing winter conditions

⚡ PERFORMANCE & CAPABILITY
• Motors: Tri-Motor All-Wheel Drive system (1 front motor + 2 independent rear motors)
• Power: 845 horsepower (Cyberbeast configuration)
• Acceleration: 0-60 mph in 2.6 seconds - matching supercar performance
• Top Speed: 130 mph electronically limited
• Towing Capacity: 11,000 lbs maximum towing capability
• Off-Road: Adaptive air suspension offering up to 16 inches of ground clearance in Extract Mode for extreme off-road terrain

🏠 INTERIOR & TECHNOLOGY
• Seating: Spacious cabin accommodating 5 adults with premium comfort seating
• Screens: 18.5-inch center touchscreen + 9.4-inch rear passenger touchscreen providing control for all vehicle functions
• Audio: 15-speaker premium sound system with powerful subwoofer
• Features: Premium materials, ambient lighting, heated seats, wireless phone charging
• Cargo: Vault-style truck bed offering 120.7 cubic feet of lockable storage with built-in power outlets (120V/240V) and compressed air outlet
• Storage: Additional front trunk (frunk) for secure storage

🛡️ SAFETY & AUTOPILOT
• Structure: Ultra-strong 30X cold-rolled stainless steel exoskeleton providing exceptional protection
• Glass: Armored glass windows for enhanced safety and security
• Cameras: 8 surround cameras providing complete 360° visibility
• Features: Automatic emergency braking, lane departure warning, blind spot monitoring, collision avoidance
• Autopilot: Full Self-Driving Capability available as optional upgrade
• Monitoring: Comprehensive driver assistance and safety monitoring systems

🌐 TECHNOLOGY & CONNECTIVITY
• Updates: Over-the-air software updates continuously improve vehicle performance and add new features at no cost
• Entertainment: Full infotainment system with streaming capabilities
• Mobile App: Remote climate control, vehicle monitoring, lock/unlock from anywhere
• Smart Features: Continuous improvements and new capabilities added remotely

📐 DIMENSIONS & SPECIFICATIONS
• Length: 223.7 inches | Width: 86.6 inches (with mirrors folded)
• Height: 70.6 inches | Weight: 6,863 lbs
• Ground Clearance: Up to 16 inches maximum in Extract Mode
• Weight Distribution: Perfect 50/50 front/rear for optimal handling
• Bed Size: 6.5 feet bed length with powered tonneau cover
• Approach/Departure Angles: Exceptional off-road angles for extreme terrain

✅ WARRANTY & SUPPORT
• Basic Vehicle Warranty: 4 years / 50,000 miles comprehensive coverage
• Battery & Drive Unit: 8 years / 150,000 miles with minimum 70% capacity retention guarantee
• Roadside Assistance: 24/7 support throughout warranty period
• Mobile Service: Tesla technicians come to your location for many repairs
• Updates: Continuous over-the-air software updates at no additional cost
• Network: Access to Tesla's global service center and Supercharger networks`
    },
    "tesla-model-3-long-range-1": {
      id: "tesla-model-3-long-range-1",
      name: "Tesla Model 3 Long Range",
      subtitle: "Tesla Model 3 Long Range 2025 • Deep Blue Metallic",
      range: "363 miles Range",
      speed: "140 mph Top Speed",
      acceleration: "0-60 in 4.2s",
      hp: "394 hp",
      price: 42490.00,
      year: 2025,
      color: "Deep Blue Metallic",
      transmission: "Automatic",
      img: "https://teslacapx.com/dash/cars/4/69c29f1b7979e.jpg",
      about: `🚗 OVERVIEW
The Tesla Model 3 Long Range represents the perfect balance of performance, efficiency, and technology in an all-electric sedan. As Tesla's most affordable and popular vehicle, the Model 3 has revolutionized the electric vehicle market with its combination of 363-mile EPA estimated range, dual motor all-wheel drive, and advanced autopilot capabilities.

🔋 BATTERY & RANGE
• Capacity: 75 kWh lithium-ion battery pack with advanced 4680 structural cells for improved energy density
• Range: 363 miles of EPA estimated range on a single charge - perfect for daily commutes and weekend road trips
• Charging Speed: 175 miles of range added in just 15 minutes via Tesla's extensive Supercharger network at peak 250kW charging speeds
• Efficiency: Industry-leading 131 MPGe combined rating makes it one of the most efficient electric vehicles on the market
• Battery Management: Advanced thermal management system ensures optimal performance in all weather conditions

⚡ PERFORMANCE & HANDLING
• Motors: Dual independent motors producing a combined 394 horsepower for exhilarating performance
• Acceleration: 0-60 mph in just 4.2 seconds with instant torque delivery
• Top Speed: 140 mph electronically governed for optimal safety and efficiency
• All-Wheel Drive: Dual motor AWD system provides precise torque vectoring for enhanced stability and cornering performance in all weather conditions
• Handling: Low center of gravity thanks to floor-mounted battery pack delivers sports car-like handling with minimal body roll
• Track Mode: Software allows enthusiasts to customize stability control, regenerative braking, and power distribution for optimal performance on racing circuits

🎯 INTERIOR & COMFORT
• Display: Stunning 15.4-inch horizontal touchscreen that controls all vehicle functions, entertainment, navigation, and climate
• Seating: Spacious interior comfortably seats 5 adults with heated front and rear seats featuring 12-way power adjustment
• Roof: Panoramic glass roof with UV protection provides an open, airy cabin feeling
• Lighting: Ambient LED lighting system with 256 customizable color options
• Audio: 17-speaker immersive sound system with active noise cancellation for concert-hall acoustics
• Storage: 23 cubic feet of trunk space plus additional 3.1 cubic feet front trunk (frunk) for a total of 26.1 cubic feet
• Materials: Sustainable vegan leather upholstery and recycled acoustic materials demonstrate environmental commitment

🛡️ SAFETY & AUTOPILOT
• Safety Rating: 5-star safety rating in every category from NHTSA with the lowest probability of injury of any vehicle tested
• Vision System: 8 external cameras, 12 ultrasonic sensors, and forward-facing radar providing complete 360-degree visibility
• Standard Features: Autopilot comes standard with automatic emergency braking, collision warning, blind spot monitoring, and lane departure avoidance
• Full Self-Driving: Optional upgrade adds Navigate on Autopilot, Auto Lane Change, Autopark, Summon, and Traffic Light/Stop Sign Control capabilities
• Structure: Rigid body structure combining aluminum and ultra-high-strength steel provides exceptional crash protection in all scenarios

🌐 TECHNOLOGY & CONNECTIVITY
• Software Updates: Over-the-air updates continuously improve vehicle performance, add new features, and enhance existing capabilities—your car literally gets better over time
• Entertainment: Tesla Theater provides access to Netflix, YouTube, Hulu, and other streaming services
• Gaming: Tesla Arcade offers gaming capabilities with controller support
• Features: Karaoke mode, web browsing, and live traffic visualization
• Premium Connectivity: Optional subscription provides satellite-view maps, video streaming, Caraoke, and internet browser access
• Mobile App: Smartphone integration allows remote climate control, vehicle locating, lock/unlock, and charge monitoring from anywhere in the world

📐 SPECIFICATIONS
• Dimensions: 184.8" length × 72.8" width × 56.8" height with a 113.2" wheelbase
• Weight: 4,048 lbs curb weight with near-perfect 47/53 front/rear weight distribution for balanced handling
• Aerodynamics: Drag coefficient of just 0.23 makes it one of the most aerodynamic production sedans ever built, maximizing efficiency and range
• Ground Clearance: 5.5 inches
• Towing: Not rated for towing applications
• Seating: 5 adult passengers with ample legroom and headroom

✅ WARRANTY & SUPPORT
• Basic Warranty: Comprehensive 4-year/50,000-mile coverage for all vehicle components
• Battery Warranty: Industry-leading 8-year/120,000-mile battery and drive unit warranty with minimum 70% capacity retention guarantee
• Roadside Assistance: 24/7 support throughout warranty period
• Service: Mobile service technicians who come to your location for many repairs and maintenance
• Supercharger Access: Access to Tesla's global network of service centers and Supercharger stations for convenient charging
• Maintenance: Designed for minimal upkeep—no oil changes, transmission fluid, spark plugs, or emission tests required`
    },
    "tesla-model-y": {
      id: "tesla-model-y",
      name: "Tesla Model Y",
      subtitle: "Tesla Model Y 2025 • Solid Black",
      range: "337 miles Range",
      speed: "155 mph Top Speed",
      acceleration: "0-60 in 3.5s",
      hp: "456 hp",
      price: 43489.96,
      year: 2025,
      color: "Solid Black",
      transmission: "Automatic",
      img: "https://teslacapx.com/dash/cars/6/69c2cf1617bff.png",
      about: `🚙 OVERVIEW
The Tesla Model Y is a mid-size all-electric crossover SUV that combines the versatility of an SUV with the performance and efficiency of a Tesla sedan. With 456 horsepower, 0-60 mph in 3.5 seconds, and 76 cubic feet of cargo space, the Model Y is perfect for families who refuse to compromise between practicality and performance.

🔋 BATTERY & CHARGING
• Capacity: 81 kWh battery pack with advanced heat pump technology for improved cold weather efficiency
• Range: 337 miles EPA estimated range—more than enough for daily commutes and weekend adventures
• Fast Charging: 162 miles of range added in just 15 minutes at Tesla Supercharger stations (250kW peak power)
• Cold Weather: Heat pump system improves efficiency by up to 30% compared to traditional resistive heating, preserving more range in winter
• Management: Advanced thermal system optimizes performance in extreme temperatures from -22°F to 122°F

⚡ PERFORMANCE & DYNAMICS
• Motors: Dual motor all-wheel drive system producing 456 horsepower and 497 lb-ft of instant torque
• Acceleration: 0-60 mph in stunning 3.5 seconds—faster than many dedicated sports cars
• Top Speed: 155 mph electronically governed
• Weight: 4,416 lbs optimally distributed with low center of gravity for responsive handling despite SUV proportions
• Torque Vectoring: Independent front and rear motors enable precise power distribution for enhanced traction in all weather
• Suspension: Optional adaptive air suspension provides adjustable ride height from 6.6" to 8.0" for improved aerodynamics or increased clearance

🛋️ INTERIOR & VERSATILITY
• Seating: Spacious cabin seats up to 7 passengers with optional third-row configuration (most buyers opt for 5-seat version with maximum cargo flexibility)
• Cargo: Second-row seats fold completely flat independently, creating massive 76 cubic feet of cargo space
• Front Storage: Additional 4.1 cubic feet front trunk (frunk) for extra secure storage
• Touchscreen: 15-inch horizontal display controlling all vehicle functions
• Audio: 13-speaker premium sound system for immersive listening experience
• Roof: Panoramic fixed glass roof spanning from front to back creates open, airy cabin
• Seats: Heated seats available in all three rows for comfort
• Charging: Wireless phone charging pads for two devices
• Materials: Sustainable synthetic leather seating and recycled plastics throughout cabin

🛡️ SAFETY TECHNOLOGY
• Rating: 5-star safety rating from NHTSA in every category—among the safest vehicles ever tested
• Structure: Rigid construction combines ultra-high-strength steel with aluminum components and reinforced battery pack that doubles as structural element
• Cameras: 8 surround cameras providing complete 360° visibility
• Sensors: 12 ultrasonic sensors and forward-facing radar for comprehensive environmental awareness
• Active Safety: Automatic emergency braking, side collision warning, obstacle-aware acceleration, blind spot monitoring, and lane departure avoidance
• Autopilot: Standard Autopilot included with Full Self-Driving Capability available as optional upgrade
• FSD Features: Navigate on Autopilot, Auto Lane Change, Autopark, Summon, Smart Summon, and Traffic Light/Stop Sign Control

🌐 TECHNOLOGY & SOFTWARE
• Updates: Over-the-air software updates continuously enhance vehicle capabilities—recent updates have added new games, improved Autopilot, increased charging speeds
• Entertainment: Tesla Theater provides access to Netflix, YouTube, Disney+, Hulu, and other streaming services
• Gaming: Tesla Arcade with controller support for immersive gaming experiences
• Features: Caraoke mode, web browsing, real-time traffic visualization
• Mobile App: Remote climate control, charging status, vehicle location, lock/unlock, and even summon the car from parking spots
• Smart Modes: Dog Mode maintains cabin temperature for pets, Camp Mode provides climate control and entertainment for overnight camping

📏 DIMENSIONS & SPECS
• Exterior: 187" length × 75.6" width × 63.9" height with 113.8" wheelbase providing spacious interior
• Aerodynamics: 0.23 drag coefficient makes it one of the most aerodynamic SUVs available, maximizing efficiency
• Ground Clearance: 6.6 inches standard (adjustable to 8.0" with optional air suspension)
• Cargo Capacity: 76 cu ft with seats folded, 30.2 cu ft behind second row, plus 4.1 cu ft frunk
• Towing: 3,500 lbs towing capacity when properly equipped
• Weight: 4,416 lbs with 48/52 weight distribution for optimal handling

🔧 WARRANTY & OWNERSHIP
• Basic Warranty: 4-year/50,000-mile comprehensive vehicle coverage
• Battery Warranty: 8-year/120,000-mile battery and drive unit warranty with guaranteed 70% capacity retention
• Mobile Service: Tesla technicians perform many repairs at your home or office
• Service Network: Comprehensive network of Tesla Service Centers provides support
• Minimal Maintenance: Virtually no scheduled maintenance required—no oil changes, transmission service, spark plugs, or emission inspections
• Regenerative Braking: Brake pads last significantly longer thanks to regenerative braking that recovers energy while slowing
• Continuous Improvement: Over-the-air updates mean your Model Y continuously improves and gains new features without visiting service center`
    },
    "tesla-model-3-long-range-1": {
      id: "tesla-model-3-long-range-1",
      name: "Tesla Model 3 Long Range",
      subtitle: "Tesla Model 3 Long Range 2025 • Deep Blue Metallic",
      range: "363 miles Range",
      speed: "140 mph Top Speed",
      acceleration: "0-60 in 4.2s",
      hp: "394 hp",
      price: 42490.00,
      year: 2025,
      color: "Deep Blue Metallic",
      transmission: "Automatic",
      img: "https://teslacapx.com/dash/cars/4/69c29f1b7979e.jpg",
      about: `🚗 OVERVIEW
The Tesla Model 3 Long Range represents the perfect balance of performance, efficiency, and technology in an all-electric sedan. With 363 miles of EPA estimated range, dual motor all-wheel drive producing 394 horsepower, and 0-60 mph in 4.2 seconds, it combines practicality with exhilarating performance. The 2025 model features updated 4680 battery cells, improved thermal management, and enhanced interior materials.

🔋 BATTERY & RANGE
• Capacity: 75 kWh lithium-ion battery with 4680 structural cells
• Range: 363 miles EPA estimated on single charge
• Charging: 175 miles in 15 minutes via Supercharger (250kW peak)
• Efficiency: 131 MPGe combined (most efficient EV)
• Management: Advanced thermal system for all weather conditions

⚡ PERFORMANCE & HANDLING
• Motors: Dual Motor AWD with torque vectoring
• Power: 394 horsepower combined output
• Acceleration: 0-60 mph in 4.2 seconds
• Top Speed: 140 mph electronically limited
• Handling: Low center of gravity, sports car-like performance
• Track Mode: Customizable performance settings

🏠 INTERIOR & COMFORT
• Seating: 5 adults with heated front and rear seats
• Screen: 15.4-inch horizontal touchscreen (all controls)
• Audio: 17-speaker immersive sound with noise cancellation
• Roof: Panoramic glass roof with UV protection
• Lighting: Ambient LED (256 color options)
• Cargo: 23 cu ft trunk + 3.1 cu ft frunk
• Materials: Vegan leather, sustainable recycled materials

🛡️ SAFETY & AUTOPILOT
• Rating: 5-Star NHTSA (lowest injury probability)
• Cameras: 8 surround cameras (360° visibility)
• Sensors: 12 ultrasonic + forward radar
• Standard: Auto emergency braking, collision warning
• Features: Blind spot monitoring, lane departure avoidance
• FSD: Full Self-Driving available (optional)

✅ WARRANTY
• Basic: 4 years / 50,000 miles
• Battery: 8 years / 120,000 miles (70% retention)`
    },
    "tesla-model-y": {
      id: "tesla-model-y",
      name: "Tesla Model Y",
      subtitle: "Tesla Model Y 2025 • Solid Black",
      range: "337 miles Range",
      speed: "155 mph Top Speed",
      acceleration: "0-60 in 3.5s",
      hp: "456 hp",
      price: 43489.96,
      year: 2025,
      color: "Solid Black",
      transmission: "Automatic",
      img: "https://teslacapx.com/dash/cars/6/69c2cf1617bff.png",
      about: `🚙 OVERVIEW
The Tesla Model Y is a mid-size all-electric crossover SUV combining versatility with performance. With 456 horsepower, 0-60 mph in 3.5 seconds, and 76 cubic feet of cargo space, it's perfect for families. Seats up to 7 passengers with optional third row.

🔋 BATTERY & CHARGING
• Capacity: 81 kWh with heat pump technology
• Range: 337 miles EPA estimated
• Charging: 162 miles in 15 min (Supercharger 250kW)
• Efficiency: 30% improved cold weather performance

⚡ PERFORMANCE
• Motors: Dual Motor AWD with torque vectoring
• Power: 456 horsepower / 497 lb-ft torque
• Acceleration: 0-60 mph in 3.5 seconds
• Top Speed: 155 mph
• Suspension: Optional adaptive air suspension

🏠 INTERIOR & VERSATILITY
• Seating: 5-7 passengers (optional third row)
• Cargo: 76 cu ft (seats folded) + 4.1 cu ft frunk
• Screen: 15-inch horizontal touchscreen
• Audio: 13-speaker premium sound
• Roof: Panoramic glass roof
• Features: Heated seats (all rows), Dog Mode, Camp Mode

🛡️ SAFETY
• Rating: 5-Star NHTSA in every category
• Cameras: 8 surround cameras (360° view)
• Sensors: 12 ultrasonic + forward radar
• Autopilot: Standard with FSD optional

✅ WARRANTY
• Basic: 4 years / 50,000 miles
• Battery: 8 years / 120,000 miles`
    },
    "tesla-roadster": {
      id: "tesla-roadster",
      name: "Tesla Roadster",
      subtitle: "Tesla Roadster Supercar 2025 • Roadster Red",
      range: "620 miles Range",
      speed: "250+ mph Top Speed",
      acceleration: "0-60 in 1.9s",
      hp: "1,200 hp",
      price: 199499.96,
      year: 2025,
      color: "Roadster Red",
      transmission: "Automatic",
      img: "https://teslacapx.com/dash/cars/7/69c3ee94623a4.webp",
      about: `🏎️ OVERVIEW
The Tesla Roadster is the ultimate electric hypercar with record-breaking 0-60 mph in 1.9 seconds, over 250 mph top speed, and unprecedented 620 miles range. With 1,200+ horsepower tri-motor powertrain and optional SpaceX Package cold gas thrusters.

🔋 BATTERY & RANGE
• Capacity: 200 kWh (largest production battery)
• Range: 620 miles EPA estimated
• Charging: 300 miles in 30 min (350kW)
• Technology: Silicon anode + aerospace cooling

⚡ EXTREME PERFORMANCE
• Motors: Tri-Motor AWD (1 front + 2 rear)
• Power: 1,200+ hp / 7,376 lb-ft wheel torque
• Acceleration: 0-60 mph in 1.9s (fastest production car)
• Quarter-Mile: 8.8 seconds @ 155 mph
• Top Speed: 250+ mph

🚀 SPACEX PACKAGE (OPTIONAL)
• Technology: Cold gas thruster system
• Thrusters: 10 rocket thrusters around vehicle
• Performance: 0-60 in ~1.1 seconds
• Capability: Brief hovering up to 6 feet

🎨 DESIGN
• Roof: Removable glass panel
• Doors: Butterfly doors
• Drag Coefficient: 0.19 (ultra-aerodynamic)
• Chassis: Aerospace aluminum + carbon fiber

✅ WARRANTY
• Basic: 4 years / 50,000 miles
• Battery: 8 years / 150,000 miles`
    },
    "tesla-model-x-2": {
      id: "tesla-model-x-2",
      name: "Tesla Model X",
      subtitle: "Tesla Model X SUV 2025 • Pearl White Multi-Coat",
      range: "329 miles Range",
      speed: "149 mph Top Speed",
      acceleration: "0-60 in 2.5s",
      hp: "1,020 hp",
      price: 87700.00,
      year: 2025,
      color: "Pearl White Multi-Coat",
      transmission: "Automatic",
      img: "https://teslacapx.com/dash/cars/8/69c3f2cabb77d.jpg",
      about: `🚐 OVERVIEW
The Tesla Model X Plaid is the world's fastest SUV with 1,020 horsepower and 0-60 mph in 2.5 seconds. Famous for Falcon Wing doors that open vertically in tight spaces. Seats 7 adults with 88 cubic feet of cargo.

🔋 BATTERY & EFFICIENCY
• Capacity: 100 kWh with 4680 structural cells
• Range: 329 miles EPA estimated
• Charging: 200 miles in 15 min (Supercharger 250kW)
• Management: Intelligent thermal system with heat pump

⚡ TRI-MOTOR PLAID PERFORMANCE
• Motors: Tri-Motor AWD (1 front + 2 rear)
• Power: 1,020 hp / 1,050+ lb-ft torque
• Acceleration: 0-60 mph in 2.5 seconds
• Quarter-Mile: 9.9 seconds @ 155 mph
• Top Speed: 149 mph

🦅 FALCON WING DOORS
• Design: Double-hinge opens upward/outward
• Clearance: Requires only 12 inches on each side
• Sensors: Auto-adjust arc to avoid obstacles
• Access: Easy entry to all three rows

🏠 LUXURY INTERIOR
• Seating: 7 adults (6 or 7-seat configurations)
• Cargo: 88 cu ft all folded + 6.7 cu ft frunk
• Screens: 17-inch + 8-inch rear passenger screen
• Audio: 22-speaker, 960-watt premium system
• Filtration: HEPA + Bioweapon Defense Mode

🛡️ SAFETY
• Rating: 5-Star NHTSA (lowest rollover: 7.4%)
• Cameras: 8 surround cameras (360° visibility)
• Autopilot: Standard with FSD optional
• Towing: 5,000 lbs capacity

✅ WARRANTY
• Basic: 4 years / 50,000 miles
• Battery: 8 years / 150,000 miles`
    },
    "tesla-powerwall": {
      id: "tesla-powerwall",
      name: "Tesla Powerwall",
      subtitle: "Tesla Powerwall 3 • Classic White",
      range: "13.5 kWh Capacity",
      speed: "N/A",
      acceleration: "N/A",
      hp: "5 kW continuous",
      price: 11000.00,
      year: 2025,
      color: "Classic White",
      transmission: "N/A",
      img: "https://teslacapx.com/dash/cars/10/69c404f5e8dc2.png",
      about: "Powerwall is an integrated battery system that stores your solar energy for backup protection, so when the grid goes down your power stays on. Your system detects outages and automatically recharges with sunlight to keep your appliances running for days."
    },
    "tesla-wall-connector": {
      id: "tesla-wall-connector",
      name: "Tesla Wall Connector",
      subtitle: "Tesla Wall Connector Charger • Silver",
      range: "44 mi/hr charge",
      speed: "N/A",
      acceleration: "N/A",
      hp: "11.5 kW max output",
      price: 498.97,
      year: 2025,
      color: "Metallic Silver",
      transmission: "N/A",
      img: "https://teslacapx.com/dash/cars/11/69c40685e0fac.jpg",
      about: "Wall Connector is our most convenient charging solution for Tesla and non-Tesla electric vehicles, ideal for houses, apartments, hospitality properties, and workplaces. Provides up to 44 miles of range per hour of charging."
    },
    "tesla-optimus": {
      id: "tesla-optimus",
      name: "Tesla Optimus",
      subtitle: "Tesla Optimus Humanoid Bot • Black & White",
      range: "24h Battery",
      speed: "5 mph",
      acceleration: "N/A",
      hp: "N/A",
      price: 28998.98,
      year: 2025,
      color: "Matte Black & White",
      transmission: "Robotic Joint Actuators",
      img: "https://teslacapx.com/dash/cars/12/69c407f660122.webp",
      about: "Optimus is a general-purpose, bi-pedal humanoid robot capable of performing tasks that are unsafe, repetitive, or boring. Designed to assist factories and home assistants, leveraging Tesla's AI and computer vision technologies."
    },
    "tesla-semi": {
      id: "tesla-semi",
      name: "Tesla Semi",
      subtitle: "Tesla Semi Truck 2025 • Arctic White",
      range: "500 miles Range",
      speed: "105 mph Top Speed",
      acceleration: "0-60 in 15s (Loaded)",
      hp: "1,020 hp",
      price: 28500.02,
      year: 2025,
      color: "Arctic White",
      transmission: "Automatic",
      img: "https://teslacapx.com/dash/cars/13/69c40a3f6c962.jpg",
      about: "The Tesla Semi is a Class 8 electric truck designed for maximum safety, efficiency, and heavy-cargo hauling power. Powered by three independent motors on rear axles providing incredible power and acceleration."
    }
  };

  const car = catalog[id] || catalog["cyber-truck"];

  const related = [
    catalog["tesla-model-3-long-range-1"],
    catalog["tesla-model-y"],
    catalog["tesla-roadster"],
    catalog["tesla-model-x-2"]
  ].filter(c => c && c.id !== car.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back button */}
      <div className="mb-6">
        <Link href="/cars" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-primary-500 transition-colors gap-2">
          <ArrowLeft size={16} /> Back to Inventory
        </Link>
      </div>

      {/* Main Vehicle Header Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-250 dark:border-gray-800 mb-10">
        <div className="h-[320px] md:h-[400px] w-full relative bg-gray-900">
          {car.id === "cyber-truck" ? (
            <video src="/cyber.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80" />
          ) : car.id === "tesla-model-3-long-range-1" ? (
            <video src="/model .mp4" autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80" />
          ) : car.id === "tesla-model-y" ? (
            <video src="/model y.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80" />
          ) : (
            <img src={car.img} alt={car.name} className="w-full h-full object-cover opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10"></div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
          <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight text-white">{car.name}</h1>
          <p className="text-sm md:text-base text-gray-300 font-semibold mb-4">{car.subtitle}</p>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="px-3 py-1.5 bg-black/45 backdrop-blur-md rounded-full border border-white/10">{car.range}</span>
            {car.acceleration !== "N/A" && (
              <span className="px-3 py-1.5 bg-black/45 backdrop-blur-md rounded-full border border-white/10">{car.acceleration}</span>
            )}
            {car.speed !== "N/A" && (
              <span className="px-3 py-1.5 bg-black/45 backdrop-blur-md rounded-full border border-white/10">{car.speed}</span>
            )}
            {car.hp !== "N/A" && (
              <span className="px-3 py-1.5 bg-black/45 backdrop-blur-md rounded-full border border-white/10">{car.hp}</span>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (About and Detailed Specs) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About Card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-gray-950 dark:text-white mb-4">About This Vehicle</h2>
            <div className="text-sm text-gray-650 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-line">
              {car.about}
            </div>
          </div>

          {/* Specs Grid */}
          <div className="bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-gray-950 dark:text-white mb-6">Key Specifications</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-xl md:text-2xl font-black text-primary-500">{car.range.split(" ")[0]}</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Range</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-black text-primary-500">
                  {car.acceleration !== "N/A" ? car.acceleration.replace("0-60 in ", "").replace("N/A", "-") : "N/A"}
                </p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Acceleration</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-black text-primary-500">{car.speed.split(" ")[0]}</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Top Speed</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-black text-primary-500">{car.hp.split(" ")[0] || "N/A"}</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Horsepower</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Order Card) */}
        <div>
          <div className="bg-white dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="text-xl font-extrabold text-gray-950 dark:text-white mb-4">Order Your {car.name}</h2>
            
            <div className="space-y-4 text-sm font-semibold">
              <div className="flex justify-between py-2 border-b border-gray-150 dark:border-gray-700">
                <span className="text-gray-400">Price</span>
                <span className="text-xl font-black text-gray-950 dark:text-white">
                  ${car.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-150 dark:border-gray-700">
                <span className="text-gray-400">Year</span>
                <span className="text-gray-900 dark:text-white">{car.year}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-150 dark:border-gray-700">
                <span className="text-gray-400">Color</span>
                <span className="text-gray-900 dark:text-white">{car.color}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-150 dark:border-gray-700">
                <span className="text-gray-400">Transmission</span>
                <span className="text-gray-900 dark:text-white">{car.transmission}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-150 dark:border-gray-700">
                <span className="text-gray-400">Availability</span>
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                  In Stock
                </span>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/login" className="group w-full flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all shadow-md shadow-primary-500/10">
                <LogIn size={16} /> Sign In to Order
              </Link>
            </div>

            <p className="text-[10px] text-gray-400 text-center mt-4">
              ✔ Secure checkout with verified payment methods
            </p>
          </div>
        </div>

      </div>

      {/* Related Vehicles Section */}
      {related.length > 0 && (
        <section className="mt-16 pt-10 border-t border-gray-250 dark:border-gray-800">
          <h2 className="text-2xl font-extrabold text-gray-950 dark:text-white mb-6">Related Vehicles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((rcar) => (
              <div key={rcar.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group">
                <div className="aspect-[4/3] overflow-hidden bg-gray-150">
                  <img src={rcar.img} alt={rcar.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm text-gray-950 dark:text-white leading-snug">{rcar.name}</h3>
                  <p className="text-xs text-primary-500 font-bold mt-1">${rcar.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  <Link href={`/cars/${rcar.id}`} className="block text-center mt-3 py-1.5 bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-lg transition-colors border border-gray-200 dark:border-gray-700">
                    View Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
