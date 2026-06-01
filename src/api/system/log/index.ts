import request from "@/utils/request";
import type {
  LogQueryParams,
  LogItem,
  VisitTrendQueryParams,
  VisitTrendDetail,
  VisitOverviewDetail,
} from "./types";

const LOG_BASE_URL = "/api/v1/logs";

const LogAPI = {
  /** 获取日志分页列表 */
  getPage(queryParams: LogQueryParams) {
    return request<unknown, PageResult<LogItem>>({
      url: `${LOG_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },

  /** 获取访问趋势统计 */
  getVisitTrend(queryParams: VisitTrendQueryParams) {
    return Promise.resolve<VisitTrendDetail>({
      dates: [
        "2024-06-30",
        "2024-07-01",
        "2024-07-02",
        "2024-07-03",
        "2024-07-04",
        "2024-07-05",
        "2024-07-06",
        "2024-07-07",
      ],
      pvList: [1751, 5168, 4882, 5301, 4721, 4885, 1901, 1003],
      uvList: [207, 566, 565, 631, 579, 496, 222, 152],
    });
  },

  /** 获取访问概览统计 */
  getVisitOverview() {
    return Promise.resolve<VisitOverviewDetail>({
      todayUvCount: 42,
      totalUvCount: 19985,
      uvGrowthRate: -0.57,
      todayPvCount: 31,
      totalPvCount: 286086,
      pvGrowthRate: -0.65,
    });
  },
};

export default LogAPI;

// 重导出类型
export * from "./types";
