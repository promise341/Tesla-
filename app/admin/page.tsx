"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Users } from "lucide-react";
import Link from "next/link";

interface Stats {
  pendingDeposits: number;
  pendingWithdrawals: number;
  pendingKyc: number;
  totalUsers: number;
  totalTransactions: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    pendingKyc: 0,
    totalUsers: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [depositsRes, withdrawalsRes, kycRes, statsRes] = await Promise.all([
          fetch("/api/admin/deposits/approve"),
          fetch("/api/admin/withdrawals/approve"),
          fetch("/api/admin/kyc/pending"),
          fetch("/api/admin/stats"),
        ]);

        const deposits = depositsRes.ok ? await depositsRes.json() : { count: 0 };
        const withdrawals = withdrawalsRes.ok ? await withdrawalsRes.json() : { count: 0 };
        const kyc = kycRes.ok ? await kycRes.json() : { count: 0 };
        const platformStats = statsRes.ok ? await statsRes.json() : {};

        setStats({
          pendingDeposits: deposits.count ?? 0,
          pendingWithdrawals: withdrawals.count ?? 0,
          pendingKyc: kyc.count ?? 0,
          totalUsers: platformStats.totalUsers ?? 0,
          totalTransactions: platformStats.totalTransactions ?? 0,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: "Pending Deposits",
      value: stats.pendingDeposits,
      icon: AlertCircle,
      href: "/admin/deposits",
      color: "bg-blue-500",
    },
    {
      label: "Pending Withdrawals",
      value: stats.pendingWithdrawals,
      icon: Clock,
      href: "/admin/withdrawals",
      color: "bg-yellow-500",
    },
    {
      label: "Pending KYC",
      value: stats.pendingKyc,
      icon: CheckCircle2,
      href: "/admin/kyc",
      color: "bg-orange-500",
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      href: "/admin/users",
      color: "bg-green-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Overview of pending approvals and platform statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {card.value}
                    </p>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg text-white`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/deposits"
            className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-center font-medium"
          >
            Review Deposits
          </Link>
          <Link
            href="/admin/withdrawals"
            className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-center font-medium"
          >
            Review Withdrawals
          </Link>
          <Link
            href="/admin/kyc"
            className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-center font-medium"
          >
            Review KYC
          </Link>
          <Link
            href="/admin/logs"
            className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-center font-medium"
          >
            View Admin Logs
          </Link>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Note:</strong> All admin actions are logged for audit purposes. Make sure to review
          all pending transactions carefully before approval.
        </p>
      </div>
    </div>
  );
}
