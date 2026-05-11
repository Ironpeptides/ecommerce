import { 
  isToday, 
  isYesterday, 
  isAfter, 
  startOfMonth, 
  startOfYear, 
  isWithinInterval, 
  startOfDay, 
  endOfDay, 
  subDays 
} from "date-fns";

export const filterByToday = (data: any[]): any[] => {
  return data.filter((item) => isToday(new Date(item.createdAt)));
};

export const filterByYesterday = (data: any[]): any[] => {
  return data.filter((item) => isYesterday(new Date(item.createdAt)));
};

export const filterByLast7Days = (data: any[]): any[] => {
  const sevenDaysAgo = subDays(new Date(), 7);
  return data.filter((item) => isAfter(new Date(item.createdAt), sevenDaysAgo));
};

export const filterByThisMonth = (data: any[]): any[] => {
  const monthStart = startOfMonth(new Date());
  return data.filter((item) => isAfter(new Date(item.createdAt), monthStart));
};

export const filterByThisYear = (data: any[]): any[] => {
  const yearStart = startOfYear(new Date());
  return data.filter((item) => isAfter(new Date(item.createdAt), yearStart));
};

export const filterByDateRange = (
  data: any[],
  startDate: string | Date,
  endDate: string | Date
): any[] => {
  const start = startOfDay(new Date(startDate));
  const end = endOfDay(new Date(endDate));
  
  return data.filter((item) => 
    isWithinInterval(new Date(item.createdAt), { start, end })
  );
};