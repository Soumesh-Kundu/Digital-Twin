"use client";

import { MACHINE_TYPE, MachinesStatus } from "@prisma/client";
import { useState, useRef, useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Thermometer,
  Activity,
  Zap,
  Gauge,
  RotateCw,
  Droplet,
  Wind,
  Flame,
  Cpu,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  AlertCircle,
  TrendingDown,
} from "lucide-react";
import { useSocketStore } from "@/stores/socket";

// Phase types
type ParamPhase = 'NORMAL' | 'APPROACHING' | 'IN_BAND' | 'COOLDOWN';

type Machine = {
  id: string;
  name: string;
  model_name: string;
  type: MACHINE_TYPE;
  status: MachinesStatus;
  temperature_max: number;
  vibration_max: number;
  power_max: number;
  thresholds: Record<string, number> | null;
};

type Props = {
  machine: Machine;
};

// Common parameters for all machine types
const commonParams = [
  {
    key: "temperature",
    label: "Temp",
    icon: Thermometer,
    unit: "°C",
    color: "#f97316",
  },
  {
    key: "vibration",
    label: "Vibration",
    icon: Activity,
    unit: "mm/s",
    color: "#3b82f6",
  },
  { key: "power", label: "Power", icon: Zap, unit: "kW", color: "#8b5cf6" },
];

// Type-specific parameters
const typeSpecificParams: Record<
  MACHINE_TYPE,
  {
    key: string;
    label: string;
    icon: React.ComponentType<any>;
    unit: string;
    color: string;
  }[]
> = {
  CNC: [
    {
      key: "rpmMax",
      label: "RPM",
      icon: RotateCw,
      unit: "rpm",
      color: "#10b981",
    },
    {
      key: "torqueMax",
      label: "Torque",
      icon: Gauge,
      unit: "Nm",
      color: "#ec4899",
    },
  ],
  HYDRAULIC: [
    {
      key: "pressureMax",
      label: "Pressure",
      icon: Gauge,
      unit: "bar",
      color: "#10b981",
    },
    {
      key: "flowRateMax",
      label: "Flow",
      icon: Wind,
      unit: "L/min",
      color: "#ec4899",
    },
    {
      key: "oilLevelMax",
      label: "Oil Lvl",
      icon: Droplet,
      unit: "%",
      color: "#f59e0b",
    },
    {
      key: "oilTemperatureMax",
      label: "Oil Temp",
      icon: Thermometer,
      unit: "°C",
      color: "#ef4444",
    },
    {
      key: "motorCurrentMax",
      label: "Current",
      icon: Zap,
      unit: "A",
      color: "#6366f1",
    },
  ],
  FURNACE: [
    {
      key: "pressureMax",
      label: "Pressure",
      icon: Gauge,
      unit: "bar",
      color: "#10b981",
    },
    {
      key: "fuelFlowMax",
      label: "Fuel",
      icon: Flame,
      unit: "L/h",
      color: "#ec4899",
    },
    {
      key: "exhaustTemperatureMax",
      label: "Exhaust",
      icon: Wind,
      unit: "°C",
      color: "#f59e0b",
    },
  ],
  ROBOTIC_ARM: [
    {
      key: "jointTorqueMax",
      label: "J.Torque",
      icon: Gauge,
      unit: "Nm",
      color: "#10b981",
    },
    {
      key: "currentMax",
      label: "Current",
      icon: Cpu,
      unit: "A",
      color: "#ec4899",
    },
    {
      key: "cycleCountMax",
      label: "Cycles",
      icon: RefreshCw,
      unit: "",
      color: "#f59e0b",
    },
  ],
};

// Max data points to keep in chart
const MAX_DATA_POINTS = 30;

// Type for chart data point
type DataPoint = {
  time: string;
  value: number | null;
};

// Type for metrics data from socket
type MetricsData = Record<string, number>;

// Type for socket message
type MachineUpdateMessage = {
  machineId: string;
  status: MachinesStatus;
  metrics: Record<string, {
    value: number;
    phase: 'NORMAL'| 'APPROACHING'| 'IN_BAND'| 'COOLDOWN';
    transition: 'ENTERING'| 'STAYING'| 'LEAVING'| 'BELOW';
  }>;
  timestamp?: string;
};

// Generate initial empty data with 30 slots (countdown from -29s to 0s)
const generateEmptyData = (): DataPoint[] => {
  return Array.from({ length: MAX_DATA_POINTS }, (_, i) => ({
    time: `${i - MAX_DATA_POINTS + 1}s`,
    value: null,
  }));
};

export default function MachineCard({ machine }: Props) {
  const allParams = useMemo(() => [
    ...commonParams,
    ...(typeSpecificParams[machine.type] || []),
  ], [machine.type]);

  const [activeTab, setActiveTab] = useState(
    allParams[0]?.key || "temperature"
  );
  
  // Initialize chart data state with 30 empty slots for each parameter
  const [chartData, setChartData] = useState<Record<string, DataPoint[]>>(() => {
    const initialData: Record<string, DataPoint[]> = {};
    [...commonParams, ...(typeSpecificParams[machine.type] || [])].forEach((param) => {
      initialData[param.key] = generateEmptyData();
    });
    return initialData;
  });

  const [machineStatus, setMachineStatus] = useState<MachinesStatus>(machine.status);
  
  // Store current phase for each parameter
  const [paramPhases, setParamPhases] = useState<Record<string, ParamPhase>>(() => {
    const initialPhases: Record<string, ParamPhase> = {};
    [...commonParams, ...(typeSpecificParams[machine.type] || [])].forEach((param) => {
      initialPhases[param.key] = 'NORMAL';
    });
    return initialPhases;
  });
  
  const [showTopArrow, setShowTopArrow] = useState(false);
  const [showBottomArrow, setShowBottomArrow] = useState(false);
  const tabsListRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocketStore();

  const activeParam = allParams.find((p) => p.key === activeTab);
  const ActiveIcon = activeParam?.icon || Thermometer;

  // Height of one tab item (44px = min-h-11)
  const TAB_HEIGHT = 64;

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    const el = tabsListRef.current;
    if (!el) return;

    const isAtTop = el.scrollTop <= 0;
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

    setShowTopArrow(!isAtTop);
    setShowBottomArrow(!isAtBottom && el.scrollHeight > el.clientHeight);
  };

  // Scroll up by one tab
  const scrollUp = () => {
    const el = tabsListRef.current;
    if (!el) return;
    el.scrollBy({ top: -TAB_HEIGHT, behavior: "smooth" });
  };

  // Scroll down by one tab
  const scrollDown = () => {
    const el = tabsListRef.current;
    if (!el) return;
    el.scrollBy({ top: TAB_HEIGHT, behavior: "smooth" });
  };

  // Handle wheel event to scroll tabs instead of page
  const handleWheel = (e: React.WheelEvent) => {
    const el = tabsListRef.current;
    if (!el) return;
    
    // Check if there's content to scroll
    const canScrollUp = el.scrollTop > 0;
    const canScrollDown = el.scrollTop + el.clientHeight < el.scrollHeight;
    
    // Only prevent default if we can scroll in that direction
    if ((e.deltaY < 0 && canScrollUp) || (e.deltaY > 0 && canScrollDown)) {
      e.preventDefault();
      e.stopPropagation();
      el.scrollBy({ top: e.deltaY, behavior: "auto" });
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const el = tabsListRef.current;
    if (el) {
      el.addEventListener("scroll", checkScrollPosition);
      // Also check on resize
      window.addEventListener("resize", checkScrollPosition);
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", checkScrollPosition);
      }
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, []);

  // Listen for namespaced machine_update and machine_status events from shared socket
  useEffect(() => {
    if (!socket) return;

    // Namespaced event names for this specific machine
    const updateEvent = `machine_update_${machine.id}`;
    const statusEvent = `machine_status_${machine.id}`;

    const handleStatusChanged = (data: { machineId: string; status: MachinesStatus; streaming: boolean }) => {
      setMachineStatus(data.status);
    };

    const handleMachineUpdate = (data: MachineUpdateMessage) => {
      // Update phases for each parameter
      setParamPhases((prevPhases) => {
        const newPhases = { ...prevPhases };
        Object.entries(data.metrics).forEach(([key, metric]) => {
          if (newPhases[key] !== undefined) {
            newPhases[key] = metric.phase;
          }
        });
        return newPhases;
      });

      setChartData((prevData) => {
        const newData = { ...prevData };

        // Update each metric that came in the data
        Object.entries(data.metrics).forEach(([key, value]) => {
          if (newData[key] !== undefined) {
            // Shift all data points left by 1 and recalculate countdown labels
            const shiftedData = newData[key].slice(1).map((point, i) => ({
              ...point,
              time: `${i - MAX_DATA_POINTS}s`,
            }));
            newData[key] = [
              ...shiftedData,
              { time: "0s", value: value.value },
            ];
          }
        });

        return newData;
      });
    };

    // Listen to namespaced events (only receives events for this machine)
    socket.on(statusEvent, handleStatusChanged);
    socket.on(updateEvent, handleMachineUpdate);

    // Cleanup listeners on unmount (but don't disconnect socket)
    return () => {
      socket.off(statusEvent, handleStatusChanged);
      socket.off(updateEvent, handleMachineUpdate);
    };
  }, [socket, machine.id]);

  // Get threshold value for the active parameter
  const getThresholdValue = (key: string) => {
    if (key === "temperature") return machine.temperature_max;
    if (key === "vibration") return machine.vibration_max;
    if (key === "power") return machine.power_max;
    return machine.thresholds?.[key] || 0;
  };

  // Get current (last non-null) value for a parameter
  const getCurrentValue = (key: string): number | null => {
    const data = chartData[key];
    if (!data) return null;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].value !== null) return data[i].value;
    }
    return null;
  };

  // Get the display phase - COOLDOWN only shows when value is below threshold
  const getDisplayPhase = (key: string, phase: ParamPhase): ParamPhase => {
    if (phase !== 'COOLDOWN') return phase;
    
    const currentValue = getCurrentValue(key);
    const threshold = getThresholdValue(key);
    
    // If value is still at or above threshold, show as IN_BAND (still critical)
    if (currentValue !== null && currentValue >= threshold * 0.95) {
      return 'IN_BAND';
    }
    // Only show COOLDOWN when value is actually below threshold band
    return 'COOLDOWN';
  };

  // Get color based on phase
  const getPhaseColor = (phase: ParamPhase, defaultColor: string): string => {
    switch (phase) {
      case 'APPROACHING':
      case 'COOLDOWN':
        return '#f59e0b'; // amber/warning
      case 'IN_BAND':
        return '#ef4444'; // red/error
      default:
        return defaultColor;
    }
  };

  // Get gradient colors based on phase
  const getPhaseGradient = (phase: ParamPhase, defaultColor: string) => {
    const color = getPhaseColor(phase, defaultColor);
    return { color, opacity: phase === 'IN_BAND' ? 0.4 : 0.3 };
  };

  // Get tab trigger classes based on phase
  const getTabTriggerClasses = (phase: ParamPhase): string => {
    const baseClasses = "flex flex-col items-center justify-center w-full min-h-11 h-11 py-1.5 px-1 shrink-0 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm relative";
    switch (phase) {
      case 'IN_BAND':
        return `${baseClasses} border-2 border-red-500`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">{machine.name}</h3>
            <p className="text-sm text-gray-500">{machine.model_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded">
              {machine.type.replace("_", " ")}
            </span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                machineStatus === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : machineStatus === "IDLE"
                  ? "bg-gray-100 text-gray-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {machineStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Content with vertical tabs */}
      <div className="flex h-64">
        {/* Left side - Vertical Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          orientation="vertical"
          className="flex flex-row h-full w-full"
        >
          <div className="flex flex-col h-full w-14 shrink-0 border-r bg-gray-50" onWheel={handleWheel}>
            {/* Top Arrow Area (always takes space) */}
            <div
              className="h-6 flex items-center justify-center shrink-0"
              onClick={showTopArrow ? scrollUp : undefined}
            >
              <ChevronUp
                className={`h-3 w-3 text-gray-500 transition-opacity ${
                  showTopArrow ? "opacity-100 cursor-pointer" : "opacity-0"
                }`}
              />
            </div>

            {/* Scrollable Tabs Area */}
            <div
              ref={tabsListRef}
              className="flex-1 overflow-y-auto  min-h-0"
              style={{
                scrollbarWidth: "none" /* Firefox */,
                msOverflowStyle: "none" /* IE/Edge */,
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none; /* Chrome/Safari/Opera */
                }
              `}</style>

              <TabsList className="flex flex-col w-full h-auto rounded-none bg-transparent px-1 gap-0.5">
                {allParams.map((param) => {
                  const Icon = param.icon;
                  const rawPhase = paramPhases[param.key] || 'NORMAL';
                  const phase = getDisplayPhase(param.key, rawPhase);
                  const phaseColor = getPhaseColor(phase, param.color);
                  
                  return (
                    <TabsTrigger
                      key={param.key}
                      value={param.key}
                      className={getTabTriggerClasses(phase)}
                      title={param.label}
                    >
                      {/* Phase indicator icon */}
                      {phase === 'APPROACHING' && (
                        <AlertTriangle className="absolute -top-1 -right-1 h-3 w-3 text-amber-500" />
                      )}
                      {phase === 'COOLDOWN' && (
                        <TrendingDown className="absolute -top-1 -right-1 h-3 w-3 text-amber-500" />
                      )}
                      {phase === 'IN_BAND' && (
                        <AlertCircle className="absolute -top-1 -right-1 h-3 w-3 text-red-500" />
                      )}
                      <Icon
                        className="h-4 w-4 shrink-0"
                        style={{ color: phaseColor }}
                      />
                      <span 
                        className="text-[10px] mt-0.5 shrink-0"
                        style={{ color: phase === 'IN_BAND' ? '#ef4444' : phase === 'APPROACHING' || phase === 'COOLDOWN' ? '#f59e0b' : '#4b5563' }}
                      >
                        {param.label}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {/* Bottom Arrow Area (if needed) */}
            <div
              className="h-6 flex items-center justify-center shrink-0"
              onClick={showBottomArrow ? scrollDown : undefined}
            >
              <ChevronDown
                className={`h-3 w-3 text-gray-500 transition-opacity ${
                  showBottomArrow ? "opacity-100 cursor-pointer" : "opacity-0"
                }`}
              />
            </div>
          </div>
          {/* Right side - Graph Content */}
          <div className="flex-1 min-w-0 p-3 -ml-7">
            {allParams.map((param) => {
              const rawPhase = paramPhases[param.key] || 'NORMAL';
              const phase = getDisplayPhase(param.key, rawPhase);
              const phaseColor = getPhaseColor(phase, param.color);
              const gradientConfig = getPhaseGradient(phase, param.color);
              
              return (
              <TabsContent
                key={param.key}
                value={param.key}
                className="h-full m-0 "
              >
                <div className="h-full flex flex-col">
                  {/* Parameter Header */}
                  <div className="flex items-center justify-between mb-2 pl-5">
                    <div className="flex items-center gap-2">
                      <param.icon
                        className="h-5 w-5"
                        style={{ color: phaseColor }}
                      />
                      {/* Phase warning/error icon */}
                      {phase === 'APPROACHING' && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      {phase === 'COOLDOWN' && (
                        <TrendingDown className="h-4 w-4 text-amber-500" />
                      )}
                      {phase === 'IN_BAND' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span 
                        className="font-medium"
                        style={{ color: phase === 'IN_BAND' ? '#ef4444' : phase === 'APPROACHING' || phase === 'COOLDOWN' ? '#f59e0b' : '#374151' }}
                      >
                        {param.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">Current: </span>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: phaseColor }}
                      >
                        {getCurrentValue(param.key)?.toFixed(2) ?? "--"} {param.unit}
                      </span>
                    </div>
                  </div>

                  {/* Graph */}
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData[param.key] || []}
                        margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id={`gradient-${param.key}-${machine.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={gradientConfig.color} stopOpacity={gradientConfig.opacity}/>
                            <stop offset="95%" stopColor={gradientConfig.color} stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 10 }}
                          stroke="#9ca3af"
                        />
                        <YAxis
                          tick={{ fontSize: 10 }}
                          stroke="#9ca3af"
                          domain={[0, (dataMax: number) => Math.max(dataMax, getThresholdValue(param.key) * 1.1)]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          formatter={(value: number) => [
                            `${value.toFixed(2)} ${param.unit}`,
                            param.label,
                          ]}
                        />
                        <ReferenceLine
                          y={getThresholdValue(param.key)}
                          stroke="#ef4444"
                          strokeDasharray="5 5"
                          strokeWidth={1.5}
                          label={{
                            value: `Threshold: ${getThresholdValue(param.key)}${param.unit}`,
                            position: "insideTopRight",
                            fill: "#ef4444",
                            fontSize: 10,
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={phaseColor}
                          strokeWidth={2}
                          fill={`url(#gradient-${param.key}-${machine.id})`}
                          activeDot={{ r: 4 }}
                          connectNulls={false}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </TabsContent>
            );
            })}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
