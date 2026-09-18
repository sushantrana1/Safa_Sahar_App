import { useState } from "react";
import { X, Coins, Loader2, Gift } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function RedeemModal({ reward, onClose, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/rewards/${reward._id}/redeem`);
      toast.success("Reward redeemed! Check My Redemptions.");
      onSuccess(data.redemption);
    } catch (err) {
      toast.error(err.response?.data?.message || "Redemption failed");
    } finally {
      setLoading(false);
    }
  };

  const remaining = (user?.points ?? 0) - reward.pointsCost;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Gift className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Confirm redemption
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Reward summary */}
        <div className="bg-slate-50 rounded-xl p-3 mb-4">
          <p className="font-semibold text-sm text-slate-900">
            {reward.title}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
            {reward.description}
          </p>
        </div>

        {/* Cost breakdown */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Cost</span>
            <span className="font-semibold text-slate-900 flex items-center gap-1">
              <Coins className="w-4 h-4 text-primary-600" />
              {reward.pointsCost}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Your balance</span>
            <span className="font-medium text-slate-700">
              {user?.points ?? 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100">
            <span className="font-medium text-slate-700">After redemption</span>
            <span
              className={`font-bold ${
                remaining >= 0 ? "text-primary-600" : "text-red-600"
              }`}
            >
              {remaining}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl py-2.5 transition
                       disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || remaining < 0}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl py-2.5 transition
                       disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Redeeming..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}