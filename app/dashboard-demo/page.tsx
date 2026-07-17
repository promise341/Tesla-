"use client";

import Link from "next/link";

export default function DashboardDemoPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-extrabold mb-4">Dashboard Video Demo</h1>

      <p className="text-sm text-gray-600 mb-6">
        Drop your dashboard recording at <code>/public/uploads/account-dashboard.mp4</code> and this page will play it.
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <video controls className="w-full rounded-md bg-black">
          <source src="/uploads/account-dashboard.mp4" type="video/mp4" />
          Your browser does not support the video tag. You can <a href="/uploads/account-dashboard.mp4" className="text-primary-500 underline">download the file</a> instead.
        </video>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <p>Helpful commands to copy the file into the workspace (PowerShell):</p>
        <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded mt-2 text-xs overflow-auto">New-Item -ItemType Directory -Path "c:\\Users\\benjamin\\.gemini\\antigravity-ide\\scratch\\tesla-capx-website\\public\\uploads" -Force
Copy-Item "C:\\Users\\benjamin\\Videos\\Captures\\Account Dashboard - Google Chrome 2026-07-11 11-55-59.mp4" -Destination "c:\\Users\\benjamin\\.gemini\\antigravity-ide\\scratch\\tesla-capx-website\\public\\uploads\\account-dashboard.mp4" -Force</pre>
      </div>

      <div className="mt-6 text-sm">
        <Link href="/cars" className="text-primary-500 font-semibold">Back to Inventory</Link>
      </div>
    </div>
  );
}
