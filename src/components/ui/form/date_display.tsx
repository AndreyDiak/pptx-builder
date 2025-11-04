import { cn } from '@/shared/utils';
import { useEffect, useState } from 'react';

export type DateDisplayMode = 'absolute' | 'relative';

interface DateDisplayProps {
  date: string | Date;
  mode?: DateDisplayMode;
  className?: string;
  showTime?: boolean;
  locale?: string;
}

export const DateDisplay = ({ 
  date, 
  mode = 'absolute', 
  className,
  showTime = false,
  locale = 'ru-RU'
}: DateDisplayProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Обновляем текущее время каждую минуту для относительного режима
  useEffect(() => {
    if (mode === 'relative') {
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000); // Обновляем каждую минуту

      return () => clearInterval(interval);
    }
  }, [mode]);

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const formatAbsoluteDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Europe/Moscow',
    };

    if (showTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return date.toLocaleDateString(locale, options);
  };

  const formatRelativeDate = (date: Date) => {
    const now = currentTime;
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Если дата в будущем
    if (diffInSeconds < 0) {
      const futureDiff = Math.abs(diffInSeconds);
      if (futureDiff < 60) return 'через несколько секунд';
      if (futureDiff < 3600) return `через ${Math.floor(futureDiff / 60)} мин.`;
      if (futureDiff < 86400) return `через ${Math.floor(futureDiff / 3600)} ч.`;
      if (futureDiff < 2592000) return `через ${Math.floor(futureDiff / 86400)} дн.`;
      return formatAbsoluteDate(date);
    }

    // Если дата в прошлом
    if (diffInSeconds < 60) return 'только что';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин. назад`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч. назад`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} дн. назад`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} мес. назад`;
    
    return formatAbsoluteDate(date);
  };

  const getDisplayText = () => {
    if (mode === 'relative') {
      return formatRelativeDate(dateObj);
    }
    return formatAbsoluteDate(dateObj);
  };

  const getTitle = () => {
    // Показываем полную дату в tooltip
    const fullDate = formatAbsoluteDate(dateObj);
    if (showTime) {
      return fullDate;
    }
    return `${fullDate} в ${dateObj.toLocaleTimeString(locale, { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Europe/Moscow'
    })}`;
  };

  return (
    <time 
      dateTime={dateObj.toISOString()}
      title={getTitle()}
      className={cn(
        'inline-block text-sm text-muted-foreground',
        className
      )}
    >
      {getDisplayText()}
    </time>
  );
};

