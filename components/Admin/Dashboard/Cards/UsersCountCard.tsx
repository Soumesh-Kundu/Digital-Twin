import { NumberTicker } from "@/components/ui/number-ticker";
import { Users, Wrench, HardHat } from "lucide-react";

type Props = {
  engineersCount: number;
  maintainerCount: number;
};

export default function UsersCountCard({
  engineersCount,
  maintainerCount,
}: Props) {
  const totalUsers = engineersCount + maintainerCount;

  return (
    <div className="col-span-4 bg-white rounded-xl shadow-md border p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">Users Overview</h3>
      </div>

      <div className="grid grid-cols-3 gap-4 h-[calc(100%-3rem)]">
        {/* Total Users */}
        <div className="flex flex-col items-center justify-center p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 mb-3">
            <Users className="h-6 w-6 text-white" />
          </div>
          <span className="text-3xl font-bold text-blue-600">
            <NumberTicker value={totalUsers} />
          </span>
          <span className="text-sm text-gray-600 mt-1">Total Users</span>
        </div>

        {/* Engineers */}
        <div className="flex flex-col items-center justify-center p-4 bg-linear-to-br from-emerald-50 to-emerald-100 rounded-lg">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500 mb-3">
            <HardHat className="h-6 w-6 text-white" />
          </div>
          <span className="text-3xl font-bold text-emerald-600">
            <NumberTicker value={engineersCount} delay={0.2} />
          </span>
          <span className="text-sm text-gray-600 mt-1">Engineers</span>
        </div>

        {/* Maintainers */}
        <div className="flex flex-col items-center justify-center p-4 bg-linear-to-br from-amber-50 to-amber-100 rounded-lg">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-500 mb-3">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <span className="text-3xl font-bold text-amber-600">
            <NumberTicker value={maintainerCount} delay={0.4} />
          </span>
          <span className="text-sm text-gray-600 mt-1">Maintainers</span>
        </div>
      </div>
    </div>
  );
}
