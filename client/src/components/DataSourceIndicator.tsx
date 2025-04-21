import React from 'react';
import { InfoIcon, DatabaseIcon, ServerOffIcon, ArchiveIcon } from 'lucide-react';

interface DataSourceIndicatorProps {
  data: any;
  className?: string;
}

/**
 * 數據來源指示器組件
 * 顯示數據是來自數據庫、緩存還是預設數據
 */
export function DataSourceIndicator({ data, className = '' }: DataSourceIndicatorProps) {
  // 如果沒有數據，則不顯示任何內容
  if (!data) return null;
  
  // 檢測數據來源
  const isCached = data._cached === true;
  const hasNote = typeof data._note === 'string';
  const note = hasNote ? data._note : '';
  
  // 如果無特殊標記，則不顯示
  if (!isCached && !hasNote) return null;
  
  return (
    <div className={`text-sm flex items-center p-2 mt-2 rounded ${className}`}>
      {isCached ? (
        <div className="bg-amber-50 text-amber-600 p-2 rounded flex items-center">
          <ArchiveIcon className="w-4 h-4 mr-1 inline" />
          <span>
            {note || '當前顯示緩存數據。資料庫同步可能延遲。'}
          </span>
        </div>
      ) : (
        <div className="bg-blue-50 text-blue-600 p-2 rounded flex items-center">
          <DatabaseIcon className="w-4 h-4 mr-1 inline" />
          <span>已從數據庫獲取即時數據</span>
        </div>
      )}
    </div>
  );
}

/**
 * 系統狀態指示器
 * 用於顯示系統狀態，如數據庫連接狀態等
 */
export function SystemStatusIndicator({ 
  status, 
  className = '' 
}: { 
  status: 'connected' | 'error' | 'degraded' | 'offline' | 'cached';
  className?: string;
}) {
  let bgColor = 'bg-green-50';
  let textColor = 'text-green-600';
  let Icon = DatabaseIcon;
  let message = '系統正常運行中';
  
  switch(status) {
    case 'error':
    case 'offline':
      bgColor = 'bg-red-50';
      textColor = 'text-red-600';
      Icon = ServerOffIcon;
      message = '資料庫連接中斷，使用本地緩存';
      break;
    case 'degraded':
      bgColor = 'bg-amber-50';
      textColor = 'text-amber-600';
      Icon = InfoIcon;
      message = '系統降級運行中，部分功能可能受限';
      break;
    case 'cached':
      bgColor = 'bg-blue-50';
      textColor = 'text-blue-600';
      Icon = ArchiveIcon;
      message = '顯示緩存數據';
      break;
  }
  
  return (
    <div className={`text-sm flex items-center p-2 rounded ${bgColor} ${textColor} ${className}`}>
      <Icon className="w-4 h-4 mr-1 inline" />
      <span>{message}</span>
    </div>
  );
}