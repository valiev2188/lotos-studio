export interface AnalyticsPeriodQuery {
  from: string;
  to: string;
}

export interface OverviewResponse {
  totalBookings: number;
  totalAttended: number;
  attendanceRate: number;
  revenue: number;
  newClients: number;
  activeSubscriptions: number;
  occupancyRate: number;
  comparison: {
    bookings: number;
    revenue: number;
    newClients: number;
  };
}

export interface AttendanceDataPoint {
  date: string;
  total: number;
  attended: number;
  noShow: number;
  cancelled: number;
}

export interface AttendanceResponse {
  daily: AttendanceDataPoint[];
  byDirection: Array<{
    directionId: string;
    directionName: string;
    total: number;
    attended: number;
  }>;
  byTrainer: Array<{
    trainerId: string;
    trainerName: string;
    total: number;
    attended: number;
  }>;
}

export interface RevenueResponse {
  total: number;
  byMethod: Record<string, number>;
  daily: Array<{
    date: string;
    amount: number;
  }>;
  topPlans: Array<{
    planId: string;
    planName: string;
    sold: number;
    revenue: number;
  }>;
  forecast: number;
}
