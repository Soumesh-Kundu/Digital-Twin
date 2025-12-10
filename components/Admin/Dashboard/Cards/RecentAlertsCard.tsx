import { AlertTriangle, AlertCircle, AlertOctagon, Info } from "lucide-react";

export type Alert = {
  id: string;
  type: "critical" | "warning" | "info";
  message: string;
  machineName?: string;
  triggeredAt: Date;
};

type Props = {
  alerts?: Alert[];
};

const alertStyles = {
  critical: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: AlertOctagon,
    iconColor: "text-red-500",
    textColor: "text-red-700",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: AlertCircle,
    iconColor: "text-amber-500",
    textColor: "text-amber-700",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Info,
    iconColor: "text-blue-500",
    textColor: "text-blue-700",
  },
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function RecentAlertsCard({ alerts = [] }: Props) {
  return (
    <div className="col-span-2 bg-white rounded-xl shadow-md border p-6 h-80 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Recent Alerts</h3>
        {alerts.length > 0 && (
          <span className="ml-auto bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {alerts.length}
          </span>
        )}
      </div>

      {alerts.length > 0 ? (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {alerts.map((alert) => {
            const style = alertStyles[alert.type];
            const Icon = style.icon;
            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${style.bg} ${style.border}`}
              >
                <div className="flex items-start gap-2">
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${style.iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${style.textColor} truncate`}>
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {alert.machineName && (
                        <span className="text-xs text-gray-500 truncate">
                          {alert.machineName}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatDate(alert.triggeredAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
            <AlertTriangle className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No alerts triggered yet</p>
          <p className="text-gray-400 text-sm mt-1">Alerts will appear here when triggered</p>
        </div>
      )}
    </div>
  );
}
