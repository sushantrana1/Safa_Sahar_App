import { Inbox } from "lucide-react";

export default function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here",
  description = "",
  action = null,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-3">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-800">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mt-1 mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}