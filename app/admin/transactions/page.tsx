"use client";

import { useEffect, useState } from "react";
import { Receipt, ArrowUpRight, ArrowDownLeft, Search, Filter, Eye, Download, X } from "lucide-react";

interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  user: {
    email: string;
    name?: string;
  };
  metadata?: {
    cryptoType?: string;
    walletAddress?: string;
    transactionHash?: string;
    proofUrl?: string;
  };
}

export default function TransactionLogsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/admin/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportTransactions = async () => {
    try {
      const response = await fetch('/api/admin/transactions?export=csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting transactions:', error);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const txDate = new Date(tx.createdAt);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = txDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = txDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = txDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      default:
        return <Receipt className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const completedTransactions = filteredTransactions.filter(tx => tx.status === 'completed');
  const pendingTransactions = filteredTransactions.filter(tx => tx.status === 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction Logs</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor all financial transactions</p>
        </div>
        
        <button
          onClick={exportTransactions}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors mt-4 sm:mt-0"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredTransactions.length.toLocaleString()}
              </p>
            </div>
            <Receipt className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalAmount.toLocaleString()}
              </p>
            </div>
            <ArrowUpRight className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedTransactions.length}
              </p>
            </div>
            <Receipt className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pendingTransactions.length}
              </p>
            </div>
            <Receipt className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="investment">Investments</option>
            <option value="profit">Profits</option>
            <option value="bonus">Bonuses</option>
          </select>
          
          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.id.slice(0, 8)}...
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {transaction.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {transaction.user.name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 capitalize">
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ${transaction.amount.toLocaleString()}
                        </div>
                        {transaction.metadata?.cryptoType && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {transaction.metadata.cryptoType}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)} capitalize`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedTx(transaction)}
                        className="p-2 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTx(null)} />
          <div className="relative bg-[#111] text-gray-300 rounded-2xl shadow-2xl border border-red-900/30 w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
            <button onClick={() => setSelectedTx(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={18} /></button>
            <h3 className="font-extrabold text-white mb-4 flex items-center gap-1.5"><Receipt size={18} className="text-red-500" /> Transaction Detail</h3>
            
            <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID</span>
                <span className="font-bold text-white font-mono break-all max-w-[250px] text-right">{selectedTx.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">User Email</span>
                <span className="font-bold text-white">{selectedTx.user.email}</span>
              </div>
              {selectedTx.user.name && (
                <div className="flex justify-between">
                  <span className="text-gray-500">User Name</span>
                  <span className="font-bold text-white">{selectedTx.user.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-white">${selectedTx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-bold text-white capitalize">{selectedTx.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-semibold px-2 py-0.5 rounded-full border text-[10px] uppercase ${
                  selectedTx.status === "completed" || selectedTx.status === "APPROVED" ? "bg-green-950/40 border-green-800/30 text-green-400" :
                  selectedTx.status === "pending" ? "bg-yellow-950/40 border-yellow-800/30 text-yellow-400" :
                  "bg-red-950/40 border-red-800/30 text-red-400"
                }`}>{selectedTx.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-bold text-white font-mono">{selectedTx.currency || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Description</span>
                <span className="font-bold text-white text-right max-w-[250px]">{selectedTx.description || "No description"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-bold text-white">{new Date(selectedTx.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {selectedTx.metadata && (Object.keys(selectedTx.metadata).length > 0) && (
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-2.5 text-xs mb-4">
                <h4 className="font-bold text-white border-b border-white/10 pb-1.5 mb-1.5">Metadata</h4>
                {selectedTx.metadata.cryptoType && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Crypto Currency</span>
                    <span className="font-bold text-white">{selectedTx.metadata.cryptoType}</span>
                  </div>
                )}
                {selectedTx.metadata.walletAddress && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Address / Wallet</span>
                    <span className="font-bold text-white font-mono break-all max-w-[250px] text-right">{selectedTx.metadata.walletAddress}</span>
                  </div>
                )}
                {selectedTx.metadata.transactionHash && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tx Hash</span>
                    <span className="font-bold text-white font-mono break-all max-w-[250px] text-right">{selectedTx.metadata.transactionHash}</span>
                  </div>
                )}
                {selectedTx.metadata.proofUrl && (
                  <div className="space-y-1">
                    <span className="text-gray-500">Proof Document</span>
                    <div className="border border-white/10 rounded-lg overflow-hidden mt-1.5">
                      <img src={selectedTx.metadata.proofUrl} alt="Transaction Proof" className="w-full h-auto max-h-48 object-contain" />
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 bg-red-800 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-red-900/40"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}