
"use client";

import { useEffect, useRef, useState } from "react";
import { LineChart as RechartsLineChart } from "recharts";
import { BarChart as RechartsBarChart } from "recharts";
import { PieChart as RechartsPieChart } from "recharts";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartProps {
  data: any;
  height?: number;
  width?: number;
  options?: any;
  className?: string;
}

export function LineChart({ data, height = 300, width, options, className }: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChart = async () => {
      try {
        const module = await import('react-chartjs-2');
        const {
          Chart: ChartJS,
          CategoryScale,
          LinearScale,
          PointElement,
          LineElement,
          Title,
          Tooltip,
          Legend
        } = await import('chart.js');
        
        ChartJS.register(
          CategoryScale,
          LinearScale,
          PointElement,
          LineElement,
          Title,
          Tooltip,
          Legend
        );
        
        setChart({
          LineChart: module.Line
        });
      } catch (error) {
        console.error("Failed to load chart library:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadChart();
  }, []);
  
  return (
    <div
      ref={chartRef}
      className={cn("w-full flex items-center justify-center", className)}
      style={{ height: height, width: width }}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <span>載入圖表中...</span>
        </div>
      ) : chart ? (
        <chart.LineChart data={data} options={options} height={height} width={width} />
      ) : (
        <div className="text-center text-muted-foreground">
          <p>無法載入圖表</p>
          <p className="text-sm">請確保已安裝所需的依賴項</p>
        </div>
      )}
    </div>
  );
}

export function BarChart({ data, height = 300, width, options, className }: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChart = async () => {
      try {
        const module = await import('react-chartjs-2');
        const {
          Chart: ChartJS,
          CategoryScale,
          LinearScale,
          BarElement,
          Title,
          Tooltip,
          Legend
        } = await import('chart.js');
        
        ChartJS.register(
          CategoryScale,
          LinearScale,
          BarElement,
          Title,
          Tooltip,
          Legend
        );
        
        setChart({
          BarChart: module.Bar
        });
      } catch (error) {
        console.error("Failed to load chart library:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadChart();
  }, []);
  
  return (
    <div
      ref={chartRef}
      className={cn("w-full flex items-center justify-center", className)}
      style={{ height: height, width: width }}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <span>載入圖表中...</span>
        </div>
      ) : chart ? (
        <chart.BarChart data={data} options={options} height={height} width={width} />
      ) : (
        <div className="text-center text-muted-foreground">
          <p>無法載入圖表</p>
          <p className="text-sm">請確保已安裝所需的依賴項</p>
        </div>
      )}
    </div>
  );
}

export function PieChart({ data, height = 300, width, options, className }: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChart = async () => {
      try {
        const module = await import('react-chartjs-2');
        const {
          Chart: ChartJS,
          ArcElement,
          Tooltip,
          Legend
        } = await import('chart.js');
        
        ChartJS.register(
          ArcElement,
          Tooltip,
          Legend
        );
        
        setChart({
          PieChart: module.Pie
        });
      } catch (error) {
        console.error("Failed to load chart library:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadChart();
  }, []);
  
  return (
    <div
      ref={chartRef}
      className={cn("w-full flex items-center justify-center", className)}
      style={{ height: height, width: width }}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <span>載入圖表中...</span>
        </div>
      ) : chart ? (
        <chart.PieChart data={data} options={options} height={height} width={width} />
      ) : (
        <div className="text-center text-muted-foreground">
          <p>無法載入圖表</p>
          <p className="text-sm">請確保已安裝所需的依賴項</p>
        </div>
      )}
    </div>
  );
}
