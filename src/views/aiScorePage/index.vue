<template>
  <div class="ai-score-page">
    <!-- 筛选栏（含导出按钮和导出时间） -->
    <div class="filter-section">
      <div class="filter-card">
        <el-form inline>
          <el-form-item w-140px label="部门">
            <el-select v-model="selectedDept" placeholder="全部" clearable @change="onDeptChange">
              <el-option label="全部" value="all" />
              <el-option label="财政局" value="财政局" />
              <el-option label="立法办" value="立法办" />
              <el-option label="教育局" value="教育局" />
              <el-option label="卫健委" value="卫健委" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              :default-value="[new Date(2026, 0, 1), new Date(2026, 11, 30)]"
              style="width: 260px"
              @change="onDateChange"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="refreshData">查询</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
          <el-form-item class="export-item">
            <span v-if="lastExportTime" class="export-time">上次导出：{{ lastExportTime }}</span>
            <el-button type="success" plain :loading="exporting" @click="exportReport">
              <el-icon><Download /></el-icon>
              导出报告
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 导出内容容器（截图区域） -->
    <div ref="reportContainerRef" class="report-container">
      <!-- 统计卡片 -->
      <div class="stats-row">
        <div class="stat-card stat-card--blue">
          <div class="stat-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">
              {{ currentStats.totalScore }}
              <span class="stat-unit">分</span>
            </div>
            <div class="stat-label">综合评分</div>
          </div>
        </div>
        <div class="stat-card stat-card--green">
          <div class="stat-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ currentStats.completionRate }}%</div>
            <div class="stat-label">填报完成率</div>
          </div>
        </div>
        <div class="stat-card stat-card--orange">
          <div class="stat-icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ currentStats.excellentDepts }}</div>
            <div class="stat-label">优秀部门</div>
          </div>
        </div>
        <div class="stat-card stat-card--purple">
          <div class="stat-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ currentStats.warningDepts }}</div>
            <div class="stat-label">需关注部门</div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="card-header">
            <h3>部门得分对比</h3>
            <el-tag size="small" effect="plain" type="info">单位：分</el-tag>
          </div>
          <div class="chart-body">
            <div ref="barChartRef" class="chart-container"></div>
          </div>
        </div>
        <div class="chart-card">
          <div class="card-header">
            <h3>填报趋势</h3>
            <el-tag size="small" effect="plain" type="info">月度变化</el-tag>
          </div>
          <div class="chart-body">
            <div ref="lineChartRef" class="chart-container"></div>
          </div>
        </div>
      </div>

      <div class="charts-row">
        <div class="chart-card">
          <div class="card-header">
            <h3>填报完成率分布</h3>
          </div>
          <div class="chart-body">
            <div ref="pieChartRef" class="chart-container"></div>
          </div>
        </div>
        <div class="insight-card">
          <div class="card-header">
            <h3>AI 核心洞察</h3>
            <el-tag size="small" round effect="plain">实时分析</el-tag>
          </div>
          <div class="insight-body">
            <div class="insight-list">
              <div v-for="(insight, idx) in insights" :key="idx" class="insight-item">
                <span class="insight-num">{{ idx + 1 }}</span>
                <span class="insight-text">{{ insight }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated, watch, nextTick } from "vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";
import { TrendCharts, Document, Star, Warning, Download } from "@element-plus/icons-vue";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// 部门列表
const departments = ["财政局", "立法办", "教育局", "卫健委"];
const months = ["1月", "2月", "3月", "4月", "5月"];

// 各部门的填报率数据（趋势）
const deptTrendData: Record<string, number[]> = {
  财政局: [58, 72, 85, 92, 98],
  立法办: [52, 68, 79, 86, 92],
  教育局: [40, 55, 68, 78, 85],
  卫健委: [10, 18, 25, 35, 48],
};

// 所有部门平均趋势（每月平均值）
const avgTrend = computed(() => {
  const sums = [0, 0, 0, 0, 0];
  departments.forEach((dept) => {
    const data = deptTrendData[dept];
    data.forEach((val, idx) => (sums[idx] += val));
  });
  return sums.map((sum) => Number((sum / departments.length).toFixed(1)));
});

// 各部门综合评分
const deptOverallScore: Record<string, number> = {
  财政局: 95.3,
  立法办: 92.1,
  教育局: 88.7,
  卫健委: 0,
};
const deptCompletionRate: Record<string, number> = {
  财政局: 98.2,
  立法办: 92.5,
  教育局: 85.6,
  卫健委: 48,
};

// 筛选条件
const selectedDept = ref("all");
const dateRange = ref(["2026-01-01", "2026-12-30"]);

// 当前统计数据
const currentStats = ref({
  totalScore: 87.3,
  completionRate: 73.8,
  excellentDepts: 5,
  warningDepts: 2,
});

// 导出相关
const exporting = ref(false);
const lastExportTime = ref("");
const reportContainerRef = ref<HTMLElement>();

// 更新统计数据
const updateStats = () => {
  if (selectedDept.value === "all") {
    currentStats.value = {
      totalScore: 87.3,
      completionRate: 73.8,
      excellentDepts: 5,
      warningDepts: 2,
    };
  } else {
    const dept = selectedDept.value;
    const score = deptOverallScore[dept];
    const rate = deptCompletionRate[dept];
    currentStats.value = {
      totalScore: score,
      completionRate: rate,
      excellentDepts: 5,
      warningDepts: 2,
    };
  }
};

// 柱状图数据
const barChartData = computed(() => {
  return departments.map((dept) => ({
    name: dept,
    score: deptOverallScore[dept],
  }));
});

// 折线图系列数据
const lineChartSeries = computed(() => {
  const series = [];
  if (selectedDept.value === "all") {
    series.push({
      name: "所有部门平均",
      data: avgTrend.value,
      type: "line",
      lineStyle: { color: "#909399", width: 2, type: "dashed" },
      symbol: "diamond",
      symbolSize: 8,
      label: { show: true, position: "top", formatter: "{c}%" },
    });
  } else {
    const dept = selectedDept.value;
    series.push({
      name: dept,
      data: deptTrendData[dept],
      type: "line",
      lineStyle: { color: "#409EFF", width: 3 },
      symbol: "circle",
      symbolSize: 8,
      label: { show: true, position: "top", formatter: "{c}%" },
      areaStyle: { opacity: 0.1, color: "#409EFF" },
    });
    series.push({
      name: "所有部门平均",
      data: avgTrend.value,
      type: "line",
      lineStyle: { color: "#909399", width: 2, type: "dashed" },
      symbol: "diamond",
      symbolSize: 6,
      label: { show: true, position: "bottom", formatter: "{c}%" },
    });
  }
  return series;
});

// 饼图数据
const pieData = ref([
  { name: "已完成", value: 73.8, color: "#67C23A" },
  { name: "进行中", value: 15.2, color: "#E6A23C" },
  { name: "未开始", value: 11.0, color: "#909399" },
]);

// AI 洞察文本
const insights = computed(() => {
  const base = [
    "财政局连续4个月得分领先，Q2达95.3分",
    "5月整体填报率回升至73.8%，但卫健委仍未启动",
    "教育局近两月得分稳步上升，从85.2提升至88.7",
    "建议6月前完成卫健委督办，否则影响Q2总评",
  ];
  if (selectedDept.value !== "all") {
    const dept = selectedDept.value;
    if (dept === "卫健委") {
      return ["卫健委填报率偏低，需立即推进", ...base.slice(1)];
    } else if (dept === "财政局") {
      return ["财政局各项指标优异，继续保持", ...base.slice(1)];
    } else if (dept === "教育局") {
      return ["教育局进步明显，后续可加大支持", ...base.slice(1)];
    } else if (dept === "立法办") {
      return ["立法办稳步推进，建议关注指标细节", ...base.slice(1)];
    }
  }
  return base;
});

// ECharts 实例
const barChartRef = ref<HTMLElement>();
const lineChartRef = ref<HTMLElement>();
const pieChartRef = ref<HTMLElement>();
let barChart: echarts.ECharts | null = null;
let lineChart: echarts.ECharts | null = null;
let pieChart: echarts.ECharts | null = null;

// 初始化柱状图
const initBarChart = () => {
  if (!barChartRef.value) return;
  if (barChart) barChart.dispose();
  barChart = echarts.init(barChartRef.value);
  const xAxis = departments;
  const seriesData = barChartData.value.map((d) => d.score);
  const option = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "10%", right: "5%", top: "10%", bottom: "5%", containLabel: true },
    xAxis: { type: "category", data: xAxis, axisLabel: { rotate: 0, fontSize: 12 } },
    yAxis: { type: "value", name: "得分", min: 0, max: 100 },
    series: [
      {
        data: seriesData,
        type: "bar",
        barWidth: "50%",
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: (params: any) => {
            const deptName = xAxis[params.dataIndex];
            if (selectedDept.value !== "all" && deptName !== selectedDept.value) return "#E6E6E6";
            return "#409EFF";
          },
        },
        label: { show: true, position: "top", formatter: "{c}分", fontSize: 12 },
      },
    ],
  };
  barChart.setOption(option);
  window.addEventListener("resize", () => barChart?.resize());
};

// 初始化折线图
const initLineChart = () => {
  if (!lineChartRef.value) return;
  if (lineChart) lineChart.dispose();
  lineChart = echarts.init(lineChartRef.value);
  const option = {
    tooltip: { trigger: "axis" },
    grid: { left: "10%", right: "5%", top: "15%", bottom: "5%", containLabel: true },
    xAxis: { type: "category", data: months, axisLabel: { fontSize: 12 } },
    yAxis: { type: "value", name: "填报率 (%)", min: 0, max: 100 },
    series: lineChartSeries.value,
  };
  lineChart.setOption(option);
  window.addEventListener("resize", () => lineChart?.resize());
};

// 初始化饼图
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
        label: { show: true, formatter: "{b}: {d}%", fontSize: 12 },
        itemStyle: { borderRadius: 8, borderColor: "#fff", borderWidth: 2 },
        color: pieData.value.map((d) => d.color),
      },
    ],
  };
  pieChart.setOption(option);
  window.addEventListener("resize", () => pieChart?.resize());
};

// 刷新所有图表
const refreshCharts = () => {
  nextTick(() => {
    initBarChart();
    initLineChart();
    initPieChart();
  });
};

// 导出报告为 PDF
const exportReport = async () => {
  if (!reportContainerRef.value) {
    ElMessage.warning("无法获取报告内容");
    return;
  }
  exporting.value = true;
  try {
    // 等待图表渲染完成（短暂延迟）
    await new Promise((resolve) => setTimeout(resolve, 300));
    const canvas = await html2canvas(reportContainerRef.value, {
      scale: 2, // 提高分辨率
      backgroundColor: "#ffffff",
      logging: false,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const imgWidth = 210; // A4宽度 mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= imgHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= imgHeight;
    }
    pdf.save(`AI评分报告_${new Date().toLocaleDateString()}.pdf`);
    // 记录导出时间
    const now = new Date();
    lastExportTime.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    ElMessage.success("报告导出成功");
  } catch (error) {
    console.error("导出失败", error);
    ElMessage.error("导出失败，请重试");
  } finally {
    exporting.value = false;
  }
};

// 事件处理
const onDeptChange = () => {
  updateStats();
  refreshCharts();
  ElMessage.success(`已切换到${selectedDept.value === "all" ? "全部部门" : selectedDept.value}`);
};

const onDateChange = () => {
  ElMessage.success(`时间范围：${dateRange.value[0]} 至 ${dateRange.value[1]}`);
  refreshCharts();
};

const refreshData = () => {
  onDeptChange();
  onDateChange();
};

const resetFilters = () => {
  selectedDept.value = "all";
  dateRange.value = ["2026-01-01", "2026-12-30"];
  updateStats();
  refreshCharts();
  ElMessage.info("已重置筛选条件");
};

watch(selectedDept, () => {
  refreshCharts();
});

onMounted(() => {
  updateStats();
  refreshCharts();
});

onActivated(() => {
  refreshCharts();
});
</script>

<style lang="scss" scoped>
/* 原有样式保持不变，新增导出时间样式 */
.ai-score-page {
  min-height: 100%;
  padding: 24px;
  background: var(--el-bg-color-page);
}

.filter-section {
  margin-bottom: 24px;
  .filter-card {
    padding: 20px 24px;
    background: var(--el-bg-color);
    border-radius: 16px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    :deep(.el-form) {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      align-items: flex-end;
      .el-form-item {
        margin-bottom: 0;
      }
    }
  }
}

.export-time {
  margin-right: 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 20px 24px;
  background: var(--el-bg-color);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    font-size: 28px;
    color: #409eff;
    background: rgba(64, 158, 255, 0.1);
    border-radius: 28px;
  }
  .stat-info {
    flex: 1;
  }
  .stat-value {
    font-size: 32px;
    font-weight: 600;
    line-height: 1.2;
    color: var(--el-text-color-primary);
    .stat-unit {
      margin-left: 4px;
      font-size: 16px;
      font-weight: 400;
      color: var(--el-text-color-secondary);
    }
  }
  .stat-label {
    margin-top: 4px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
  &--blue .stat-icon {
    color: #409eff;
    background: rgba(64, 158, 255, 0.1);
  }
  &--green .stat-icon {
    color: #67c23a;
    background: rgba(103, 194, 58, 0.1);
  }
  &--orange .stat-icon {
    color: #e6a23c;
    background: rgba(230, 162, 60, 0.1);
  }
  &--purple .stat-icon {
    color: #9059d6;
    background: rgba(144, 89, 214, 0.1);
  }
}

.export-item {
  margin-left: auto;
}
.export-time {
  margin-left: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card,
.insight-card {
  overflow: hidden;
  background: var(--el-bg-color);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.3s;
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }
  .chart-body {
    padding: 16px 16px 20px;
  }
  .insight-body {
    padding: 8px 20px 20px;
  }
}

.chart-container {
  width: 100%;
  height: 320px;
}

.insight-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.insight-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  .insight-num {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-8);
    border-radius: 12px;
  }
  .insight-text {
    flex: 1;
    font-size: 14px;
    line-height: 1.5;
    color: var(--el-text-color-regular);
  }
}

.report-container {
  background: inherit;
}

@media (max-width: 1200px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .charts-row {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
@media (max-width: 768px) {
  .ai-score-page {
    padding: 16px;
  }
  .filter-card :deep(.el-form) {
    flex-direction: column;
    align-items: stretch;
    .el-form-item {
      width: 100%;
      margin-bottom: 12px;
    }
  }
  .stat-card {
    padding: 16px;
    .stat-icon {
      width: 48px;
      height: 48px;
      font-size: 24px;
    }
    .stat-value {
      font-size: 26px;
    }
  }
}
</style>
