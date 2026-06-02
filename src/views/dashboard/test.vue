<template>
  <div class="analysis-page">
    <!-- 顶部：标题 + 筛选栏 -->
    <div class="top-bar">
      <div class="title-area">
        <h2 class="page-title">AI 智能分析概览</h2>
        <span class="update-time">{{ updateTime }} 更新</span>
      </div>
      <div class="filter-area">
        <div class="filter-item">
          <span class="filter-label">填报日期</span>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :default-value="[new Date(2026, 0, 1), new Date(2026, 5, 2)]"
            size="small"
          />
        </div>
        <el-button type="primary" size="small" @click="handleQuery">查询分析</el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-value">
            {{ stats.totalCount }}
          </div>
          <div class="stat-label">填报总数</div>
        </div>
        <div class="stat-trend up">+{{ stats.totalTrend }}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-value">
            {{ stats.passRate }}
            <span class="unit">%</span>
          </div>
          <div class="stat-label">AI合格率</div>
        </div>
        <div class="stat-trend up">+{{ stats.passTrend }}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-value">{{ stats.avgScore }}</div>
          <div class="stat-label">平均得分</div>
        </div>
        <div class="stat-trend up">+{{ stats.scoreTrend }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-value">{{ stats.needImprove }}</div>
          <div class="stat-label">待改进指标</div>
        </div>
        <div class="stat-trend neutral">需关注与整改</div>
      </div>
    </div>

    <!-- AI 洞察与建议 + 评分分布 -->
    <div class="insight-row">
      <div class="insight-card">
        <h3>AI洞察与建议</h3>
        <div class="insight-list">
          <div v-for="(item, idx) in insights" :key="idx" class="insight-item">
            <el-icon class="insight-icon"><ChatDotRound /></el-icon>
            <span class="insight-text">{{ item }}</span>
          </div>
        </div>
      </div>
      <div class="chart-card">
        <h3>评分分布</h3>
        <div ref="pieChartRef" class="pie-chart"></div>
      </div>
    </div>

    <!-- 消息通知（状态标签优化：发布绿色、催办橙色、撤回红色） -->
    <div class="message-card">
      <div class="message-header">
        <h3>消息通知</h3>
        <el-button link type="primary" size="small" @click="handleToNotices">全部 &gt;</el-button>
      </div>
      <div class="message-list">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="message-item"
          :class="{ 'is-unread': msg.unread }"
        >
          <div class="msg-left">
            <div class="msg-title-line">
              <span class="msg-title">{{ msg.title }}</span>
              <span v-if="msg.unread" class="unread-badge-inline">未读</span>
            </div>
            <div class="msg-meta">
              <el-tag :type="getStatusTagType(msg.status)" size="small" class="status-tag">
                {{ msg.status }}
              </el-tag>
              <span class="msg-time">{{ msg.time }}</span>
            </div>
          </div>
          <div class="msg-right">
            <div class="msg-content">{{ msg.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from "vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";
import { ChatDotRound } from "@element-plus/icons-vue";
import router from "@/router";

const dateRange = ref(["2026-01-01", "2026-06-02"]);
const updateTime = ref("2026-06-02 11:00");

const stats = ref({
  totalCount: 87,
  totalTrend: 12,
  passRate: 85.6,
  passTrend: 5,
  avgScore: 85.6,
  scoreTrend: 3.2,
  needImprove: 24,
});

const insights = ref([
  "筛选期内填报完成率91.7%，高于全省平均水平（83.2%），整体执行情况良好",
  "建议办理质量模版得分偏低（72分），建议重点关注建议办理环节的规范性",
  "3项指标证明文件不完整，建议提醒相关部门补充第三方审计材料",
]);

const messages = ref([
  {
    id: "1",
    title: "ZB-2026-001 立法指标考核",
    status: "发布",
    time: "06-02 08:30",
    content: "请在2026-06-15前完成填报",
    unread: true,
  },
  {
    id: "2",
    title: "ZB-2026-003 监督工作考评",
    status: "发布",
    time: "06-01 14:15",
    content: "请在2026-06-20前完成填报",
    unread: true,
  },
  {
    id: "3",
    title: "ZB-2026-005 代表履职评价",
    status: "催办",
    time: "06-01 09:00",
    content: "请在2026-06-30前完成填报",
    unread: true,
  },
  {
    id: "4",
    title: "ZB-2026-002 预算审查监督",
    status: "撤回",
    time: "05-30 16:45",
    content: "指标内容变更，已由上级撤回",
    unread: false,
  },
  {
    id: "5",
    title: "ZB-2026-004 建议办理质量",
    status: "撤回",
    time: "05-28 10:20",
    content: "指标内容变更，已由上级撤回",
    unread: false,
  },
]);

const pieData = ref([
  { name: "优秀", value: 12, color: "#67C23A" },
  { name: "良好", value: 8, color: "#409EFF" },
  { name: "待改进", value: 4, color: "#E6A23C" },
]);

const pieChartRef = ref<HTMLElement>();
let pieChart: echarts.ECharts | null = null;

const initPieChart = () => {
  if (!pieChartRef.value) return;
  if (pieChart) pieChart.dispose();
  pieChart = echarts.init(pieChartRef.value);
  const option = {
    tooltip: { trigger: "item" },
    legend: { orient: "vertical", left: "left", textStyle: { fontSize: 12 } },
    series: [
      {
        type: "pie",
        radius: "55%",
        data: pieData.value,
        label: { show: true, formatter: "{b}: {d}%", fontSize: 11 },
        itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 2 },
        color: pieData.value.map((d) => d.color),
      },
    ],
  };
  pieChart.setOption(option);
  window.addEventListener("resize", () => pieChart?.resize());
};

const handleQuery = () => {
  ElMessage.success(`查询范围：${dateRange.value[0]} 至 ${dateRange.value[1]}`);
};

const handleToNotices = () => {
  router.push("/notices");
};

// 状态标签颜色映射：发布绿色、催办橙色、撤回红色
const getStatusTagType = (status: string) => {
  if (status === "发布") return "success";
  if (status === "催办") return "warning";
  if (status === "撤回") return "danger";
  return "info";
};

onMounted(() => initPieChart());
onActivated(() => initPieChart());
</script>

<style lang="scss" scoped>
.analysis-page {
  min-height: 100vh;
  padding: 24px;
  background: #f5f7fa;
}

.top-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  .title-area {
    display: flex;
    gap: 12px;
    align-items: baseline;
    .page-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }
    .update-time {
      font-size: 12px;
      color: #5b6e8c;
    }
  }
  .filter-area {
    display: flex;
    gap: 12px;
    align-items: center;
    .filter-item {
      display: flex;
      gap: 8px;
      align-items: center;
      .filter-label {
        font-size: 13px;
        color: #606266;
      }
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 28px;
  .stat-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    transition: all 0.2s;
    &:hover {
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
      transform: translateY(-2px);
    }
    .stat-info {
      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #1e293b;
        .unit {
          margin-left: 2px;
          font-size: 14px;
          font-weight: 400;
        }
      }
      .stat-label {
        margin-top: 6px;
        font-size: 13px;
        color: #5b6e8c;
      }
    }
    .stat-trend {
      padding: 4px 12px;
      font-size: 13px;
      font-weight: 500;
      border-radius: 30px;
      &.up {
        color: #10b981;
        background: #d1fae5;
      }
      &.neutral {
        color: #d97706;
        background: #fef3c7;
      }
    }
  }
}

.insight-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 28px;
  .insight-card,
  .chart-card {
    padding: 20px 24px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    h3 {
      padding-left: 12px;
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      border-left: 3px solid #3b82f6;
    }
  }
  .insight-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    .insight-item {
      display: flex;
      gap: 12px;
      .insight-icon {
        flex-shrink: 0;
        margin-top: 2px;
        font-size: 18px;
        color: #3b82f6;
      }
      .insight-text {
        font-size: 13px;
        line-height: 1.5;
        color: #334155;
      }
    }
  }
  .pie-chart {
    width: 100%;
    height: 240px;
  }
}

.message-card {
  padding: 20px 24px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  .message-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
  }
  .message-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .message-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #edf2f7;
    transition: background 0.1s;
    &:last-child {
      border-bottom: none;
    }
    &.is-unread {
      padding: 12px 24px;
      margin: 0 -24px;
      background: #f8fafc;
      border-radius: 12px;
    }
    .msg-left {
      flex: 2;
      .msg-title-line {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 6px;
        .msg-title {
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
        }
        .unread-badge-inline {
          padding: 2px 8px;
          font-size: 11px;
          color: white;
          background: #3b82f6;
          border-radius: 20px;
        }
      }
      .msg-meta {
        display: flex;
        gap: 12px;
        align-items: center;
        .status-tag {
          padding: 2px 10px;
          font-weight: 500;
          border: none;
        }
        .msg-time {
          font-size: 11px;
          color: #5b6e8c;
        }
      }
    }
    .msg-right {
      flex: 3;
      .msg-content {
        font-size: 13px;
        color: #334155;
      }
    }
  }
}

@media (max-width: 1000px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .insight-row {
    grid-template-columns: 1fr;
  }
  .top-bar {
    flex-direction: column;
    align-items: stretch;
    .filter-area {
      justify-content: flex-end;
    }
  }
}
</style>
