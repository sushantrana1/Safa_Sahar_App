import { Gift, Coins, Package, AlertCircle } from "lucide-react";

const CATEGORY_LABELS = {
  voucher: "Voucher",
  merchandise: "Merchandise",
  service: "Service",
  other: "Other",
};

export default function RewardCard({ reward, userPoints, onRedeem }) {
  const affordable = userPoints >= reward.pointsCost;
  const inStock = reward.stock > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
      {/* Image / placeholder */}
      <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative overflow-hidden group">
        {reward.imageUrl ? (
          <>
            <img
              src={reward.imageUrl}
              alt={reward.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </>
        ) : (
          <Gift className="w-12 h-12 text-primary-600" />
        )}

        {/* Category chip */}
        <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide bg-white/95 backdrop-blur-sm text-primary-700 rounded-full px-2 py-0.5 shadow-sm">
          {CATEGORY_LABELS[reward.category] || "Reward"}
        </span>

        {/* Stock badge */}
        {reward.stock === 0 ? (
          <span className="absolute top-2 right-2 text-[10px] font-bold uppercase bg-red-500 text-white rounded-full px-2 py-0.5 shadow-sm">
            Out of stock
          </span>
        ) : reward.stock <= 5 ? (
          <span className="absolute top-2 right-2 text-[10px] font-bold uppercase bg-yellow-400 text-yellow-900 rounded-full px-2 py-0.5 shadow-sm">
            Only {reward.stock} left
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">
          {reward.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 mb-3">
          {reward.description}
        </p>

        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <Package className="w-3.5 h-3.5" />
          <span>
            {inStock ? `${reward.stock} in stock` : "Out of stock"}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-primary-700 font-bold">
            <Coins className="w-4 h-4" />
            {reward.pointsCost}
          </div>

          <button
            onClick={() => onRedeem(reward)}
            disabled={!affordable || !inStock}
            className={`text-xs font-medium rounded-lg px-3 py-2 transition flex items-center gap-1.5
              ${
                affordable && inStock
                  ? "bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-500/20"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
          >
            {!inStock ? (
              "Out of stock"
            ) : !affordable ? (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                Need {reward.pointsCost - userPoints} more
              </>
            ) : (
              "Redeem"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}