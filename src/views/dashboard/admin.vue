<template>
  <div class="dash">
    <!-- ============================================================
    Header: greeting + links
    ============================================================ -->
    <section class="dash-header">
      <div class="card dash-header__card">
        <div class="dash-header__start">
          <div class="dash-avatar">
            <img v-if="userStore.userInfo.avatar" :src="userStore.userInfo.avatar" alt="" />
            <el-icon v-else :size="22"><User /></el-icon>
          </div>
          <div class="dash-header__text">
            <h1 class="dash-header__greeting">{{ greetings }}</h1>
            <p class="dash-header__date">{{ currentDateStr }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
    Stats: 4 cards, no border, shadow only
    ============================================================ -->
    <section class="dash-stats">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--blue">
          <el-icon :size="18"><User /></el-icon>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__num">{{ 48 }}</span>
          <span class="stat-card__label">指标总数</span>
        </div>
        <span
          class="stat-card__trend stat-card__1"
          style="cursor: pointer"
          @click="router.push('/indicatorList/index')"
        >
          全部
        </span>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--green">
          <el-icon :size="18"><Avatar /></el-icon>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__num">{{ displayTransitionUvCount }}</span>
          <span class="stat-card__label">已发布</span>
        </div>
        <!-- 已移除 2026Q1 标签 -->
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--orange">
          <el-icon :size="18"><Monitor /></el-icon>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__num">{{ displayTransitionPvCount }}</span>
        </div>
        <span v-if="pvGrowthText !== '--'" class="stat-card__trend stat-card__3">填报中</span>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--purple">
          <el-icon :size="18"><Star /></el-icon>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__num">9</span>
        </div>
        <span class="stat-card__trend stat-card__4">已完成</span>
      </div>
    </section>

    <!-- ============================================================
    Recent visits: collapsible history (like Alibaba Cloud)
    ============================================================ -->
    <section v-if="recentMenus.length" class="dash-recent">
      <div class="card">
        <div class="card__head">
          <h3 class="card__title">最近访问</h3>
          <div class="card__head-actions">
            <el-button type="primary" link size="small" @click="clearRecentMenus">清空</el-button>
            <el-button type="primary" link size="small" @click="recentExpanded = !recentExpanded">
              {{ recentExpanded ? "收起" : "展开" }}
              <el-icon :size="12">
                <ArrowUp v-if="recentExpanded" />
                <ArrowDown v-else />
              </el-icon>
            </el-button>
          </div>
        </div>
        <div class="card__body">
          <div class="recent-grid" :class="{ 'recent-grid--fold': !recentExpanded }">
            <div
              v-for="item in recentMenus"
              :key="item.path"
              class="recent-grid__item"
              @click="router.push(item.path)"
            >
              <div class="recent-grid__icon">
                <el-icon v-if="item.icon?.startsWith('el-icon-')" :size="15">
                  <component :is="item.icon.replace('el-icon-', '')" />
                </el-icon>
                <span
                  v-else-if="item.icon"
                  :class="`i-svg:${item.icon}`"
                  class="recent-grid__svg"
                />
                <el-icon v-else :size="15"><Menu /></el-icon>
              </div>
              <span class="recent-grid__name">{{ item.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================
    Chart (commented out)
    ============================================================ -->

    <!-- ============================================================
    Bottom: AI report + top5 + recent events
    ============================================================ -->

    <div class="dash-layout">
      <section class="dash-layout-start">
        <div class="card">
          <div class="card__head">
            <h3 class="card__title">AI 智能分析报告</h3>
            <el-tag size="small" round cursor-pointer>重新分析</el-tag>
          </div>
          <div class="card__body">
            <div class="ai-report">
              <!-- 核心结论区域 -->
              <div class="report-section report-section--conclusion">
                <div class="report-section__header">
                  <el-icon class="report-section__icon" :size="18"><DataLine /></el-icon>
                  <span class="report-section__title">本期核心结论</span>
                </div>
                <div class="report-section__body">
                  <div class="conclusion-stats">
                    <div class="stat-item">
                      <span class="stat-label">总体完成率</span>
                      <span class="stat-value stat-value--primary">85.7%</span>
                      <span class="stat-trend">↑ 4.2%</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">研发原局立法指标</span>
                      <span class="stat-value">87.3%</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">财政池预算执行率</span>
                      <span class="stat-value">91.2%</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">自定义指标完成率</span>
                      <span class="stat-value">78.6%</span>
                    </div>
                  </div>
                  <p class="conclusion-text">
                    本季度共涉及
                    <strong>12个下级部门</strong>
                    、
                    <strong>48项指标</strong>
                    评估。 总体完成率
                    <strong>85.7%</strong>
                    ，较上期提升
                    <strong class="trend-up">4.2个百分点</strong>
                    。
                  </p>
                </div>
              </div>

              <!-- 注意事项区域 -->
              <div class="report-section report-section--warning">
                <div class="report-section__header">
                  <el-icon class="report-section__icon" :size="18"><WarningFilled /></el-icon>
                  <span class="report-section__title">注意事项</span>
                </div>
                <div class="report-section__body">
                  <div class="warning-list">
                    <div class="warning-item">
                      <el-icon class="warning-icon" :size="14"><InfoFilled /></el-icon>
                      <span>
                        城建局、交通局
                        <strong>2个部门</strong>
                        指标完成率低于
                        <span class="warning-value">60%</span>
                      </span>
                    </div>
                    <div class="warning-item">
                      <el-icon class="warning-icon" :size="14"><Clock /></el-icon>
                      <span>请主管部门关注并推动整改，建议主管部门关注并提交整改方案</span>
                    </div>
                    <div class="warning-item">
                      <el-icon class="warning-icon" :size="14"><TrendCharts /></el-icon>
                      <span>
                        下季度将重点考核
                        <strong>数字化建设</strong>
                        相关指标，请提前准备
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 部门完成进度 Top 5 -->
      <section class="dash-layout-end">
        <div class="card dash-progress">
          <div class="card__head">
            <h3 class="card__title">
              <el-icon class="title-icon"><TrendCharts /></el-icon>
              部门完成进度 Top 5
            </h3>
          </div>
          <div class="card__body">
            <div class="progress-list">
              <div v-for="item in topDepartments" :key="item.name" class="progress-item">
                <div class="progress-item__info">
                  <span class="dept-name">{{ item.name }}</span>
                  <span class="dept-percent">{{ item.percent }}%</span>
                </div>
                <div class="progress-bar-bg">
                  <div
                    class="progress-bar-fill"
                    :style="{ width: item.percent + '%' }"
                    :class="{
                      'fill-high': item.percent >= 90,
                      'fill-mid': item.percent >= 80 && item.percent < 90,
                      'fill-low': item.percent < 80,
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 近期动态 -->
    <section class="dash-recent-events">
      <div class="card">
        <div class="card__head">
          <h3 class="card__title">
            <el-icon class="title-icon"><Bell /></el-icon>
            近期动态
          </h3>
          <el-tag cursor-pointer size="small" round effect="plain">查看全部</el-tag>
        </div>
        <div class="card__body card__body--no-padding">
          <div class="event-list">
            <div class="event-list__header">
              <span class="col-dept">部门名称</span>
              <span class="col-type">操作类型</span>
              <span class="col-target">相关指标</span>
              <span class="col-time">时间</span>
              <span class="col-status">状态</span>
            </div>
            <div v-for="event in recentEvents" :key="event.id" class="event-list__row">
              <span class="col-dept">{{ event.dept }}</span>
              <span class="col-type">{{ event.type }}</span>
              <span class="col-target">{{ event.target }}</span>
              <span class="col-time">{{ event.time }}</span>
              <span class="col-status">
                <el-tag :type="event.statusType" size="small" effect="plain">
                  {{ event.status }}
                </el-tag>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "Dashboard", inheritAttrs: false });

import { dayjs } from "element-plus";
import { computed, ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import LogAPI from "@/api/system/log";
import type { VisitOverviewDetail, VisitTrendDetail } from "@/api/system/log";
import { useUserStore } from "@/stores/user";
import { formatGrowthRate } from "@/utils";
import { useTransition } from "@vueuse/core";
import { useRecentMenus } from "@/composables";
import {
  User,
  Avatar,
  Monitor,
  Star,
  ArrowUp,
  ArrowDown,
  Clock,
  Menu,
  DataLine,
  WarningFilled,
  InfoFilled,
  TrendCharts,
  Bell,
} from "@element-plus/icons-vue";

const router = useRouter();
const userStore = useUserStore();
const { recentMenus, clearRecentMenus } = useRecentMenus();
const recentExpanded = ref(false);

const hours = new Date().getHours();
const greetings = computed(() => {
  const n = userStore.userInfo.nickname;
  if (hours >= 6 && hours < 8) return `早安，${n}`;
  if (hours >= 8 && hours < 12) return `上午好，${n}`;
  if (hours >= 12 && hours < 18) return `下午好，${n}`;
  if (hours >= 18 && hours < 24) return `晚上好，${n}`;
  return `夜深了，${n}`;
});

// 部门完成进度数据
const topDepartments = [
  { name: "财政局", percent: 93.2 },
  { name: "立法办", percent: 89.7 },
  { name: "教育局", percent: 85.1 },
  { name: "卫生平健委", percent: 79.4 },
];

// 近期动态数据
const recentEvents = ref([
  {
    id: 1,
    dept: "财政局",
    type: "提交填报",
    target: "预算执行情况报告",
    time: "2026-03-28 14:32",
    status: "已通过",
    statusType: "success",
  },
  {
    id: 2,
    dept: "城建局",
    type: "AI审核中",
    target: "城市建设年度计划完成情况",
    time: "2026-03-27 09:15",
    status: "待审核",
    statusType: "warning",
  },
  {
    id: 3,
    dept: "教育局",
    type: "提交填报",
    target: "义务教育普及率",
    time: "2026-03-26 16:44",
    status: "已通过",
    statusType: "success",
  },
]);

const currentDateStr = computed(() => {
  const d = new Date();
  const w = ["日", "一", "二", "三", "四", "五", "六"];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${w[d.getDay()]}`;
});

const visitOverviewData = ref<VisitOverviewDetail>({
  todayUvCount: 0,
  uvGrowthRate: 0,
  totalUvCount: 0,
  todayPvCount: 0,
  pvGrowthRate: 0,
  totalPvCount: 0,
});

const pvGrowthText = computed(() => {
  const r = visitOverviewData.value.pvGrowthRate;
  return r == null ? "--" : formatGrowthRate(r);
});

const tUv = useTransition(
  computed(() => visitOverviewData.value.todayUvCount),
  {
    duration: 800,
    transition: [0.25, 0.1, 0.25, 1.0],
  }
);
const tPv = useTransition(
  computed(() => visitOverviewData.value.todayPvCount),
  {
    duration: 800,
    transition: [0.25, 0.1, 0.25, 1.0],
  }
);
const displayTransitionUvCount = computed(() => Math.round(Number((tUv as any)?.value ?? tUv)));
const displayTransitionPvCount = computed(() => Math.round(Number((tPv as any)?.value ?? tPv)));

const visitTrendDateRange = ref(7);
const visitTrendChartOptions = ref({});

function fetchVisitOverviewData() {
  LogAPI.getVisitOverview().then((d) => {
    visitOverviewData.value = d;
  });
}

function fetchVisitTrendData() {
  const s = dayjs()
    .subtract(visitTrendDateRange.value - 1, "day")
    .toDate();
  LogAPI.getVisitTrend({
    startDate: dayjs(s).format("YYYY-MM-DD"),
    endDate: dayjs(new Date()).format("YYYY-MM-DD"),
  }).then((d) => {
    updateVisitTrendChartOptions(d);
  });
}

function updateVisitTrendChartOptions(d: VisitTrendDetail) {
  visitTrendChartOptions.value = {
    tooltip: {
      trigger: "axis",
      borderWidth: 0,
      padding: [8, 12],
      extraCssText: "box-shadow: 0 2px 12px rgba(0,0,0,0.08); border-radius: 8px;",
    },
    legend: {
      data: ["浏览量", "访客量"],
      bottom: 0,
      textStyle: { fontSize: 12 },
      itemWidth: 10,
      itemHeight: 8,
      itemGap: 24,
    },
    grid: { left: "0%", right: "4%", bottom: "14%", top: "4%", containLabel: true },
    xAxis: {
      type: "category",
      data: d.dates,
      axisTick: { show: false },
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { type: "dashed" } },
      axisLabel: { fontSize: 11 },
    },
    series: [
      {
        name: "浏览量",
        type: "line",
        data: d.pvList,
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        showSymbol: false,
        lineStyle: { color: "#409EFF", width: 2.5 },
        itemStyle: { color: "#409EFF" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(64,158,255,0.12)" },
              { offset: 1, color: "rgba(64,158,255,0.0)" },
            ],
          },
        },
      },
      {
        name: "访客量",
        type: "line",
        data: d.uvList,
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        showSymbol: false,
        lineStyle: { color: "#67C23A", width: 2.5 },
        itemStyle: { color: "#67C23A" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(103,194,58,0.12)" },
              { offset: 1, color: "rgba(103,194,58,0.0)" },
            ],
          },
        },
      },
    ],
  };
}

watch(
  () => visitTrendDateRange.value,
  () => fetchVisitTrendData(),
  { immediate: true }
);
onMounted(() => {
  fetchVisitOverviewData();
});
</script>

<style lang="scss" scoped>
// ============================================================
// Tokens
// ============================================================
$gap: 16px;
$pad: 16px;
$radius: 10px;

%card {
  overflow: hidden;
  background: var(--content-bg);
  border: 1px solid var(--border-color);
  border-radius: $radius;
}

.dash {
  display: flex;
  flex-direction: column;
  gap: $gap;
  padding: $pad;
}

.dash-header {
  &__card {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
  }
  &__start {
    display: flex;
    gap: 14px;
    align-items: center;
  }
  &__text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  &__greeting {
    margin: 0;
    font-size: 20px;
    font-weight: 400;
    line-height: 1.3;
    color: var(--el-text-color-primary);
    letter-spacing: -0.01em;
  }
  &__date {
    margin: 0;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
  &__end {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 10px 14px;
    background: var(--el-color-primary-light-9);
    border-radius: 8px;
  }
}

.dash-layout {
  display: flex;
  justify-content: space-between;
  &-start {
    flex: 3;
    margin-right: 16px;
  }
  &-end {
    flex: 2;
  }
}

.dash-avatar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  overflow: hidden;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 50%;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.dash-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $gap;
}

.stat-card {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 24px;
  @extend %card;

  &__1 {
    display: flex;
    padding: 2px 8px;
    color: #409eff;
    cursor: pointer;
    background-color: rgba(64, 158, 255, 0.1);
    border-radius: 4px;
    @media (prefers-color-scheme: dark) {
      background-color: rgba(64, 158, 255, 0.2);
    }
  }
  &__2 {
    display: flex;
    padding: 2px 8px;
    color: #67c23a;
    background-color: rgba(103, 194, 58, 0.1);
    border-radius: 4px;
    @media (prefers-color-scheme: dark) {
      background-color: rgba(103, 194, 58, 0.2);
    }
  }
  &__3 {
    display: flex;
    padding: 2px 8px;
    color: #e6a23c;
    background-color: rgba(230, 162, 60, 0.1);
    border-radius: 4px;
    @media (prefers-color-scheme: dark) {
      background-color: rgba(230, 162, 60, 0.2);
    }
  }
  &__4 {
    display: flex;
    padding: 2px 8px;
    color: #9059d6;
    background-color: rgba(144, 89, 214, 0.1);
    border-radius: 4px;
    @media (prefers-color-scheme: dark) {
      background-color: rgba(144, 89, 214, 0.2);
    }
  }
  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    &--blue {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }
    &--green {
      color: var(--el-color-success);
      background: var(--el-color-success-light-9);
    }
    &--orange {
      color: var(--el-color-warning);
      background: var(--el-color-warning-light-9);
    }
    &--purple {
      color: var(--el-color-primary-light-3);
      background: var(--el-color-primary-light-9);
    }
  }
  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }
  &__num {
    font-size: 28px;
    font-weight: 600;
    line-height: 1.2;
    color: var(--el-text-color-primary);
    letter-spacing: -0.02em;
  }
  &__label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  &__badge {
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 500;
    &--on {
      color: var(--el-color-success);
    }
    &--off {
      color: var(--el-color-danger);
    }
  }
  &__trend {
    display: inline-flex;
    flex-shrink: 0;
    gap: 2px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    &--up {
      color: var(--el-color-danger);
    }
  }
}

.card {
  @extend %card;
  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
  }
  &__title {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
  &__body {
    padding: 0 20px 20px;
    &--scroll {
      flex: 1;
      padding: 0;
      overflow-y: auto;
    }
  }
}

.dash-bottom {
  display: grid;
  grid-template-columns: 1fr;
  gap: $gap;
}

.todo-row {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 0;
  & + & {
    border-top: 1px solid var(--el-border-color-lighter);
  }
  &--done {
    .todo-row__title {
      color: var(--el-text-color-placeholder);
      text-decoration: line-through;
    }
  }
  &__icon--pending {
    flex-shrink: 0;
    color: var(--el-color-warning);
  }
  &__icon--done {
    flex-shrink: 0;
    color: var(--el-color-success);
  }
  &__title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    color: var(--el-text-color-regular);
    white-space: nowrap;
  }
  &__tag {
    flex-shrink: 0;
  }
  &__time {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
}

.feed {
  display: flex;
  flex-direction: column;
  padding: 8px 20px 16px;
  &__item {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: baseline;
    padding: 9px 0 9px 16px;
    &::before {
      position: absolute;
      top: 22px;
      bottom: -4px;
      left: 3px;
      width: 1px;
      content: "";
      background: var(--el-border-color-lighter);
    }
    &:last-child::before {
      display: none;
    }
  }
  &__dot {
    position: absolute;
    top: 12px;
    left: 0;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    &--blue {
      background: var(--el-color-primary);
    }
    &--green {
      background: var(--el-color-success);
    }
    &--orange {
      background: var(--el-color-warning);
    }
    &--purple {
      background: var(--el-color-primary-light-3);
    }
    &--grey {
      background: var(--el-text-color-placeholder);
    }
  }
  &__text {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    line-height: 1.4;
    color: var(--el-text-color-regular);
  }
  &__time {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
}

.card__head-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.recent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 2px;
  &--fold {
    max-height: 42px;
    overflow: hidden;
  }
  &__item {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 10px;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color 0.15s;
    &:hover {
      background: var(--el-fill-color);
    }
  }
  &__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-lighter);
    border-radius: 5px;
  }
  &__svg {
    width: 14px;
    height: 14px;
  }
  &__name {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    color: var(--el-text-color-regular);
    white-space: nowrap;
  }
}

.ai-report {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.report-section {
  background: var(--el-fill-color-lighter);
  border-radius: 12px;
  transition: all 0.2s;
  &--conclusion {
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.05), rgba(64, 158, 255, 0.01));
    border-left: 3px solid var(--el-color-primary);
  }
  &--warning {
    background: linear-gradient(135deg, rgba(230, 162, 60, 0.05), rgba(230, 162, 60, 0.01));
    border-left: 3px solid var(--el-color-warning);
  }
  &__header {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 14px 20px 8px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  &__icon {
    color: var(--el-text-color-secondary);
  }
  &__title {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
  &__body {
    padding: 16px 20px 20px 20px;
  }
}

.conclusion-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 110px;
  .stat-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  .stat-value {
    font-size: 22px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    letter-spacing: -0.01em;
    &--primary {
      font-size: 26px;
      color: var(--el-color-primary);
    }
  }
  .stat-trend {
    font-size: 12px;
    font-weight: 500;
    color: var(--el-color-success);
  }
}

.conclusion-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
  strong {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  .trend-up {
    font-weight: 600;
    color: var(--el-color-success);
  }
}

.warning-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.warning-item {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 13px;
  line-height: 1.4;
  color: var(--el-text-color-regular);
  .warning-icon {
    flex-shrink: 0;
    color: var(--el-color-warning);
  }
  strong {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  .warning-value {
    font-weight: 600;
    color: var(--el-color-danger);
  }
}

.dash-progress {
  height: 100%;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.progress-item {
  &__info {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: 13px;
  }
  .dept-name {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
  .dept-percent {
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    letter-spacing: -0.2px;
  }
  .progress-bar-bg {
    height: 6px;
    overflow: hidden;
    background-color: var(--el-fill-color-light);
    border-radius: 10px;
  }
  .progress-bar-fill {
    height: 100%;
    border-radius: 10px;
    transition: width 0.3s ease;
    &.fill-high {
      background: linear-gradient(90deg, #67c23a, #95d475);
    }
    &.fill-mid {
      background: linear-gradient(90deg, #409eff, #79bbff);
    }
    &.fill-low {
      background: linear-gradient(90deg, #e6a23c, #f5d18b);
    }
  }
}

.title-icon {
  margin-right: 6px;
  font-size: 16px;
  vertical-align: middle;
}

.card__body--no-padding {
  padding: 0;
}

.event-list {
  font-size: 13px;
  &__header,
  &__row {
    display: grid;
    grid-template-columns: 100px 100px 1fr 160px 80px;
    gap: 12px;
    align-items: center;
    padding: 12px 20px;
  }
  &__header {
    font-weight: 500;
    color: var(--el-text-color-secondary);
    background-color: var(--el-fill-color-lighter);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  &__row {
    border-bottom: 1px solid var(--el-border-color-lighter);
    transition: background 0.2s;
    &:hover {
      background-color: var(--el-fill-color-light);
    }
    &:last-child {
      border-bottom: none;
    }
  }
  .col-dept,
  .col-type,
  .col-target,
  .col-time,
  .col-status {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .col-dept {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
  .col-target {
    color: var(--el-text-color-regular);
  }
  .col-time {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
}

@media (max-width: 992px) {
  .event-list {
    overflow-x: auto;
    &__header,
    &__row {
      min-width: 700px;
    }
  }
}

@media (max-width: 1200px) {
  .dash-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .dash-header__card {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 992px) {
  .dash-bottom {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dash {
    gap: 14px;
    padding: 14px;
  }
  .dash-stats {
    grid-template-columns: 1fr;
  }
}
</style>
