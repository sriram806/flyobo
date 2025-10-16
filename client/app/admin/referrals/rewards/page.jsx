"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { NEXT_PUBLIC_BACKEND_URL } from "@/app/config/env";
import {
  Award,
  DollarSign,
  Gift,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
  Users,
  TrendingUp,
  Settings,
  Clock
} from "lucide-react";

const AdminRewardsManagement = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [rewardStats, setRewardStats] = useState({});
  
  const [newReward, setNewReward] = useState({
    type: 'referral_bonus',
    name: '',
    description: '',
    amount: 0,
    minReferrals: 1,
    isActive: true,
    expiryDays: 30,
    maxClaims: null
  });

  const API_URL = NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  const rewardTypes = [
    { value: 'referral_bonus', label: 'Referral Bonus', icon: Users },
    { value: 'signup_bonus', label: 'Signup Bonus', icon: Gift },
    { value: 'milestone_bonus', label: 'Milestone Bonus', icon: Award },
    { value: 'tier_bonus', label: 'Tier Bonus', icon: TrendingUp }
  ];

  useEffect(() => {
    fetchRewards();
    fetchRewardStats();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockRewards = [
        {
          id: 1,
          type: 'referral_bonus',
          name: 'Standard Referral',
          description: 'Basic referral reward for inviting friends',
          amount: 100,
          minReferrals: 1,
          isActive: true,
          expiryDays: 30,
          totalClaimed: 245,
          totalAmount: 24500,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          type: 'milestone_bonus',
          name: '10 Referrals Milestone',
          description: 'Bonus for reaching 10 successful referrals',
          amount: 500,
          minReferrals: 10,
          isActive: true,
          expiryDays: null,
          totalClaimed: 23,
          totalAmount: 11500,
          createdAt: new Date().toISOString()
        }
      ];
      setRewards(mockRewards);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      toast.error("Failed to load rewards");
    } finally {
      setLoading(false);
    }
  };

  const fetchRewardStats = async () => {
    try {
      // Mock stats - replace with actual API call
      setRewardStats({
        totalRewardsGiven: 268,
        totalAmountPaid: 36000,
        activeRewards: 2,
        pendingClaims: 15
      });
    } catch (error) {
      console.error("Error fetching reward stats:", error);
    }
  };

  const handleAddReward = async (e) => {
    e.preventDefault();
    try {
      // Mock API call - replace with actual implementation
      const mockNewReward = {
        id: rewards.length + 1,
        ...newReward,
        totalClaimed: 0,
        totalAmount: 0,
        createdAt: new Date().toISOString()
      };
      
      setRewards([...rewards, mockNewReward]);
      setShowAddModal(false);
      setNewReward({
        type: 'referral_bonus',
        name: '',
        description: '',
        amount: 0,
        minReferrals: 1,
        isActive: true,
        expiryDays: 30,
        maxClaims: null
      });
      toast.success("Reward created successfully");
    } catch (error) {
      toast.error("Failed to create reward");
    }
  };

  const handleEditReward = async (rewardId, updatedData) => {
    try {
      setRewards(rewards.map(reward => 
        reward.id === rewardId ? { ...reward, ...updatedData } : reward
      ));
      setEditingReward(null);
      toast.success("Reward updated successfully");
    } catch (error) {
      toast.error("Failed to update reward");
    }
  };

  const handleDeleteReward = async (rewardId) => {
    if (!confirm("Are you sure you want to delete this reward?")) return;
    
    try {
      setRewards(rewards.filter(reward => reward.id !== rewardId));
      toast.success("Reward deleted successfully");
    } catch (error) {
      toast.error("Failed to delete reward");
    }
  };

  const toggleRewardStatus = async (rewardId) => {
    try {
      setRewards(rewards.map(reward => 
        reward.id === rewardId ? { ...reward, isActive: !reward.isActive } : reward
      ));
      toast.success("Reward status updated");
    } catch (error) {
      toast.error("Failed to update reward status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rewards Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure and manage referral rewards</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add New Reward
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rewards Given</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{rewardStats.totalRewardsGiven || 0}</p>
            </div>
            <Gift className="h-8 w-8 text-sky-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount Paid</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{rewardStats.totalAmountPaid || 0}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Rewards</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{rewardStats.activeRewards || 0}</p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Claims</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{rewardStats.pendingClaims || 0}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Rewards Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reward Configuration</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reward
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Requirements
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rewards.map((reward) => {
                const rewardType = rewardTypes.find(t => t.value === reward.type);
                const Icon = rewardType?.icon || Gift;
                
                return (
                  <tr key={reward.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-sky-100 dark:bg-sky-900 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {reward.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {reward.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {rewardType?.label || reward.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-green-600">₹{reward.amount}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {reward.minReferrals > 1 ? `${reward.minReferrals} referrals` : 'No minimum'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleRewardStatus(reward.id)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          reward.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}
                      >
                        {reward.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div>{reward.totalClaimed} claims</div>
                        <div className="text-xs text-gray-500">₹{reward.totalAmount} total</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingReward(reward)}
                          className="text-sky-600 hover:text-sky-900 dark:hover:text-sky-400"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReward(reward.id)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Reward Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Reward</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddReward} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reward Name
                    </label>
                    <input
                      type="text"
                      value={newReward.name}
                      onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reward Type
                    </label>
                    <select
                      value={newReward.type}
                      onChange={(e) => setNewReward({ ...newReward, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
                    >
                      {rewardTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newReward.description}
                    onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reward Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={newReward.amount}
                      onChange={(e) => setNewReward({ ...newReward, amount: parseFloat(e.target.value) })}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Min. Referrals Required
                    </label>
                    <input
                      type="number"
                      value={newReward.minReferrals}
                      onChange={(e) => setNewReward({ ...newReward, minReferrals: parseInt(e.target.value) })}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Expiry (Days)
                    </label>
                    <input
                      type="number"
                      value={newReward.expiryDays || ''}
                      onChange={(e) => setNewReward({ ...newReward, expiryDays: e.target.value ? parseInt(e.target.value) : null })}
                      min="1"
                      placeholder="No expiry"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={newReward.isActive}
                      onChange={(e) => setNewReward({ ...newReward, isActive: e.target.checked })}
                      className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Active immediately
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
                  >
                    Create Reward
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRewardsManagement;