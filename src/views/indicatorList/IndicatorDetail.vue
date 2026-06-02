<template>
  <div class="detail-page">
    <!-- 头部 -->
    <div class="detail-header">
      <div class="title-group">
        <h2 class="title">{{ indicatorName }}</h2>
        <el-tag :type="statusTagType" size="large">{{ statusText }}</el-tag>
      </div>
      <el-button link class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
    </div>

    <!-- 统计卡片（紧凑） -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalDepts }}</div>
        <div class="stat-label">涉及部门</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.submittedDepts }}/{{ stats.totalDepts }}</div>
        <div class="stat-label">已填报</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">
          {{ stats.avgScore }}
          <span class="unit">分</span>
        </div>
        <div class="stat-label">平均得分</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.aiSuggestionsCount }}</div>
        <div class="stat-label">AI优化建议</div>
      </div>
    </div>

    <!-- 各部门填报详情（横向卡片） -->
    <div class="section-header">
      <h3 class="section-title">各部门填报详情</h3>
    </div>
    <div class="dept-grid">
      <div v-for="dept in departments" :key="dept.id" class="dept-card">
        <div class="dept-card-header">
          <span class="dept-name">{{ dept.name }}</span>
          <el-tag v-if="dept.status === 'not_started'" type="danger" size="small">未填报</el-tag>
          <el-tag v-else type="success" size="small">已完成</el-tag>
        </div>
        <div class="dept-card-body">
          <!-- AI评分（居中显示） -->
          <div v-if="dept.status === 'submitted'" class="score-center">
            <div class="score-value">
              {{ dept.score }}
              <span class="score-unit">分</span>
            </div>
            <div class="score-label">AI评分</div>
          </div>
          <!-- 已提交部门：文件和AI评语 -->
          <template v-if="dept.status === 'submitted'">
            <div v-if="dept.files?.length" class="file-list">
              <div v-for="file in dept.files" :key="file.name" class="file-item">
                <el-icon><Document /></el-icon>
                <span>{{ file.name }}</span>
              </div>
            </div>
            <div class="ai-comment">
              <div class="comment-label">AI评语</div>
              <p>{{ dept.aiComment }}</p>
            </div>
          </template>
          <!-- 待提交/未填报部门：提示信息 -->
          <div v-else class="status-message danger">
            <el-icon><CircleCloseFilled /></el-icon>
            <span>未开始填报，需立即督办</span>
          </div>
        </div>
        <div class="dept-card-footer">
          <el-button link type="primary" size="small" @click="gotoDeptDetail(dept)">
            查看详情
          </el-button>
        </div>
      </div>
    </div>

    <!-- AI 智能比对分析（拆分为两个独立区域） -->
    <div class="section-header">
      <h3 class="section-title">AI 智能比对分析</h3>
    </div>
    <!-- 核心发现区域 -->
    <div class="core-findings-card">
      <h4>核心发现</h4>
      <ul>
        <li v-for="(finding, idx) in coreFindings" :key="idx">{{ finding }}</li>
      </ul>
    </div>
    <!-- 部门得分对比区域 -->
    <div class="score-compare-card">
      <h4>部门得分对比</h4>
      <el-table :data="scoreTableData" border stripe size="small" class="score-table">
        <el-table-column prop="name" label="部门" />
        <el-table-column prop="score" label="得分">
          <template #default="{ row }">{{ row.score || "—" }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" />
      </el-table>
    </div>

    <!-- 风险预警与改进建议 -->
    <div class="bottom-grid">
      <div class="risk-card">
        <h4>
          <el-icon><Warning /></el-icon>
          风险预警
        </h4>
        <ul>
          <li v-for="(risk, idx) in risks" :key="idx">{{ risk }}</li>
        </ul>
      </div>
      <div class="suggest-card">
        <h4>
          <el-icon><Opportunity /></el-icon>
          改进建议
        </h4>
        <ul>
          <li v-for="(sug, idx) in suggestions" :key="idx">{{ sug }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const indicatorId = route.query.id as string;
const indicatorName = (route.query.name as string) || "指标详情";
const status = (route.query.status as string) || "已发布";

const statusText = computed(() => status);
const statusTagType = computed(() => (status === "已发布" ? "success" : "info"));

// 统计数据
const stats = ref({
  totalDepts: 4,
  submittedDepts: 2,
  avgScore: 87.3,
  aiSuggestionsCount: 6,
});

interface Department {
  id: string;
  name: string;
  status: "submitted" | "not_started";
  score?: number;
  files?: { name: string }[];
  aiComment?: string;
}

// 部门数据（示例）
const departments = ref<Department[]>([
  {
    id: "1",
    name: "财政局",
    status: "submitted",
    score: 95.3,
    files: [{ name: "立法完成情况报告.pdf" }, { name: "佐证材料汇总.docx" }],
    aiComment:
      "填报数据完整，佐证材料齐全，各项指标均能如实反映。建议对未违规违纪，进一步推进立法质量。",
  },
  {
    id: "2",
    name: "立法办",
    status: "not_started",
    score: 92.1,
    aiComment: "大部分数据已填报，尚缺部分佐证材料。立法目标完成率较高，建议尽快补充缺失文件。",
  },
  {
    id: "3",
    name: "教育局",
    status: "submitted",
    score: 88.7,
    files: [],
    aiComment: "数据填报完整，但量化指标方面尚有提升空间，建议增加具体案例说明。",
  },
  {
    id: "4",
    name: "卫健委",
    status: "not_started",
  },
]);

const scoreTableData = computed(() => {
  return departments.value.map((dept) => ({
    name: dept.name,
    score: dept.score,
    status: dept.status === "submitted" ? "已完成" : "未填报",
  }));
});

const coreFindings = ref([
  "财政局整体表现最优 AI评分为95.3分，佐证材料齐全，各项指标均能如实反映。",
  "立法办仍处于待提交状态，缺少关键佐证材料，建议督促尽快完成数据上报。",
  "卫健委未开始填报，作为重点民生部门，需高度重视其指标完成进度。",
]);

const risks = ref([
  "卫健委尚未开始填报，逾期将影响整体评价结果。",
  "立法办佐证材料不完整，AI无法对其部分数据进行交叉验证。",
]);

const suggestions = ref([
  "建议将卫健委纳入重点督导清单，配备专人对接指导",
  "建立材料预审机制，在正式提交前由 AI 自动检查完整性",
  "为各部门设置填报进度提醒，提前3天推送催办通知",
]);

const goBack = () => {
  router.back();
};

const gotoDeptDetail = (dept: Department) => {
  router.push({
    path: "/dept-detail",
    query: {
      indicatorId,
      deptId: dept.id,
      deptName: dept.name,
    },
  });
};
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  padding: 24px;
  background: #f5f7fa;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  .back-btn {
    padding: 8px 12px;
    font-size: 14px;
    border-radius: 20px;
    &:hover {
      background: #eef2f6;
    }
  }
  .title-group {
    display: flex;
    gap: 16px;
    align-items: center;
    .title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #1e293b;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
  .stat-card {
    padding: 14px 12px;
    text-align: center;
    background: white;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    .stat-value {
      font-size: 26px;
      font-weight: 700;
      color: #1e293b;
      .unit {
        margin-left: 2px;
        font-size: 13px;
        font-weight: 400;
      }
    }
    .stat-label {
      margin-top: 4px;
      font-size: 13px;
      color: #5b6e8c;
    }
  }
}

.section-header {
  margin: 24px 0 14px;
  .section-title {
    padding-left: 12px;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    border-left: 3px solid #3b82f6;
  }
}

.dept-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

.dept-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s;
  &:hover {
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
  .dept-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: #fafcfc;
    border-bottom: 1px solid #edf2f7;
    .dept-name {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
    }
  }
  .dept-card-body {
    flex: 1;
    padding: 16px;
    .score-center {
      margin: 8px 0 12px;
      text-align: center;
      .score-value {
        font-size: 36px;
        font-weight: 700;
        line-height: 1;
        color: #3b82f6;
        .score-unit {
          margin-left: 2px;
          font-size: 14px;
          font-weight: 400;
        }
      }
      .score-label {
        margin-top: 4px;
        font-size: 12px;
        color: #5b6e8c;
      }
    }
    .file-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
      .file-item {
        display: inline-flex;
        gap: 6px;
        align-items: center;
        padding: 4px 10px;
        font-size: 12px;
        color: #1e293b;
        background: #f1f5f9;
        border-radius: 30px;
        .el-icon {
          font-size: 14px;
        }
      }
    }
    .ai-comment {
      padding: 10px 12px;
      background: #f8fafc;
      border-radius: 12px;
      .comment-label {
        margin-bottom: 4px;
        font-size: 12px;
        font-weight: 500;
        color: #475569;
      }
      p {
        margin: 0;
        font-size: 13px;
        line-height: 1.45;
        color: #334155;
      }
    }
    .status-message {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 10px 12px;
      margin: 12px 0;
      font-size: 13px;
      border-radius: 12px;
      &.warning {
        color: #b45309;
        background: #fef9e6;
        .el-icon {
          color: #e6a23c;
        }
      }
      &.danger {
        color: #c2410c;
        background: #fef2f2;
        .el-icon {
          color: #f56c6c;
        }
      }
    }
  }
  .dept-card-footer {
    padding: 8px 16px 12px;
    text-align: right;
    border-top: 1px solid #edf2f7;
    .el-button {
      font-size: 12px;
    }
  }
}

.core-findings-card {
  padding: 16px 20px;
  margin-bottom: 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  h4 {
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
  }
  ul {
    padding-left: 20px;
    margin: 0;
    li {
      margin-bottom: 10px;
      font-size: 14px;
      line-height: 1.5;
      color: #334155;
    }
  }
}

.score-compare-card {
  padding: 16px 20px;
  margin-bottom: 24px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  h4 {
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
  }
  .score-table {
    overflow: hidden;
    border-radius: 12px;
  }
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  .risk-card,
  .suggest-card {
    padding: 16px 20px;
    background: white;
    border-radius: 20px;
    h4 {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 16px;
      font-weight: 600;
    }
    ul {
      padding-left: 20px;
      margin: 0;
      li {
        margin-bottom: 10px;
        font-size: 14px;
        line-height: 1.45;
        color: #334155;
      }
    }
  }
  .risk-card {
    border-left: 3px solid #f56c6c;
    h4 .el-icon {
      color: #f56c6c;
    }
  }
  .suggest-card {
    border-left: 3px solid #67c23a;
    h4 .el-icon {
      color: #67c23a;
    }
  }
}

@media (max-width: 800px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .dept-grid {
    grid-template-columns: 1fr;
  }
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}
</style>
