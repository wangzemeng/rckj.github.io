<template>
  <div class="detail-page">
    <!-- 头部返回按钮 -->
    <div class="page-header">
      <div class="title-section">
        <h2 class="page-title">指标详情</h2>
        <el-tag type="success" effect="plain" size="small">已填报</el-tag>
      </div>
      <el-button link class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回指标列表
      </el-button>
    </div>

    <!-- 指标信息卡片 -->
    <div class="info-card card">
      <div class="card-header">
        <h3>指标信息</h3>
      </div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="指标编号">{{ detailData.code }}</el-descriptions-item>
        <el-descriptions-item label="指标名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="发布日期">{{ detailData.publishDate }}</el-descriptions-item>
        <el-descriptions-item label="截止日期">{{ detailData.deadline }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 已填报数据卡片 -->
    <div class="data-card card">
      <div class="card-header">
        <h3>已填报数据</h3>
      </div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="2026立法目标数量">
          <span class="data-highlight">{{ detailData.targetCount }} 项</span>
        </el-descriptions-item>
        <el-descriptions-item label="2026立法完成数量">
          <span class="data-highlight">{{ detailData.completedCount }} 项</span>
        </el-descriptions-item>
        <el-descriptions-item label="完成率">
          <span class="completion-rate">{{ detailData.completionRate }}%</span>
        </el-descriptions-item>
        <el-descriptions-item label="填报日期">{{ detailData.submitDate }}</el-descriptions-item>
        <el-descriptions-item label="提交人" :span="2">
          {{ detailData.submitter }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 证明材料卡片 -->
    <div class="file-card card">
      <div class="card-header">
        <h3>证明材料</h3>
      </div>
      <div class="file-list">
        <div v-for="file in detailData.files" :key="file.name" class="file-item">
          <div class="file-icon">
            <el-icon><Document /></el-icon>
          </div>
          <span class="file-name">{{ file.name }}</span>
          <div class="file-actions">
            <el-button link type="primary" size="small" @click="previewFile(file)">预览</el-button>
            <el-button link type="primary" size="small" @click="downloadFile(file)">下载</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- AI 智能分析卡片 -->
    <div class="ai-card card">
      <div class="card-header">
        <h3>AI 智能分析</h3>
      </div>
      <div class="score-grid">
        <div class="score-item">
          <div class="score-label">数据完整性</div>
          <el-progress
            :percentage="detailData.aiScores.integrity"
            :stroke-width="8"
            color="#409EFF"
          />
          <div class="score-desc">{{ detailData.aiScores.integrityDesc }}</div>
        </div>
        <div class="score-item">
          <div class="score-label">数据准确性</div>
          <el-progress
            :percentage="detailData.aiScores.accuracy"
            :stroke-width="8"
            color="#67C23A"
          />
          <div class="score-desc">{{ detailData.aiScores.accuracyDesc }}</div>
        </div>
        <div class="score-item">
          <div class="score-label">提交及时性</div>
          <el-progress
            :percentage="detailData.aiScores.timeliness"
            :stroke-width="8"
            color="#E6A23C"
          />
          <div class="score-desc">{{ detailData.aiScores.timelinessDesc }}</div>
        </div>
        <div class="score-item">
          <div class="score-label">文件规范性</div>
          <el-progress
            :percentage="detailData.aiScores.normativity"
            :stroke-width="8"
            color="#F56C6C"
          />
          <div class="score-desc">{{ detailData.aiScores.normativityDesc }}</div>
        </div>
      </div>

      <!-- 综合评分 - 全新样式 -->
      <div class="total-score-wrapper">
        <div class="total-score-card">
          <div class="total-score-left">
            <div class="total-score-label">综合评分</div>
            <div class="total-score-value">{{ detailData.totalScore }}</div>
            <div class="total-score-unit">/ 100</div>
          </div>
          <div class="total-score-right">
            <div class="total-grade-badge">{{ detailData.totalGrade }}</div>
            <div class="total-score-desc">基于填报数据、提交时效、文件规范性等多维度综合评分</div>
          </div>
        </div>
      </div>

      <div class="analysis-report">
        <h4>总结分析报告</h4>
        <div class="report-content">
          <div v-for="(line, idx) in detailData.report" :key="idx" class="report-line">
            <el-icon><Check /></el-icon>
            <span>{{ line }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部返回按钮 -->
    <div class="action-footer">
      <el-button size="large" @click="goBack">返回指标列表</el-button>
    </div>

    <!-- PDF预览弹窗 -->
    <el-dialog v-model="previewVisible" title="文件预览" width="80%" top="5vh" destroy-on-close>
      <iframe :src="previewUrl" class="pdf-preview-iframe" frameborder="0"></iframe>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

const router = useRouter();

const detailData = ref({
  code: "ZB-2026-001",
  name: "2026年度立法工作汇总统计",
  publishDate: "2026-02-10",
  deadline: "2026-05-30",
  targetCount: 15,
  completedCount: 14,
  completionRate: 93.3,
  submitDate: "2026-05-20 14:30",
  submitter: "张三（省级人大办公厅）",
  files: [
    { name: "2026年立法工作计划文件.pdf", type: "pdf", url: "../../../public/file/report.pdf" },
    {
      name: "立法完成情况说明.docx",
      type: "doc",
      url: "../../../public/file/立法完成情况说明.docx",
    },
  ],
  aiScores: {
    integrity: 95,
    integrityDesc: "立法目标、完成数量及说明材料均已完整提交",
    accuracy: 88,
    accuracyDesc: "填报数据与实际情况基本一致，完成率自动计算正确",
    timeliness: 90,
    timelinessDesc: "截止日期前完成提交，截止日期前10天",
    normativity: 85,
    normativityDesc: "证明材料齐全，文件格式符合规范，建议补充完善归档",
  },
  totalScore: 89,
  totalGrade: "良好",
  report: [
    "指标完成情况总体良好：2026年立法目标数量15项，已完成14项，完成率93.3%，接近全面完成目标。",
    "待改进项：文件规范性得分85分，建议后续提交前确认所有证明材料均已加盖公章并扫描为高清PDF格式。",
    "时效性优异：填报响应及时，建议保持现有填报节奏。",
    "对比分析：与上一年度同期相比，完成率提升5.2个百分点，数据完整性评分提高8分，整体进步明显。",
  ],
});

const previewVisible = ref(false);
const previewUrl = ref("");

const previewFile = (file: any) => {
  if (file.type === "pdf") {
    previewUrl.value = file.url;
    previewVisible.value = true;
  } else {
    ElMessage.info("暂不支持预览此文件格式，请下载后查看");
  }
};

const downloadFile = (file: any) => {
  const link = document.createElement("a");
  link.href = file.url;
  link.download = file.name;
  link.click();
  ElMessage.success(`开始下载：${file.name}`);
};

const goBack = () => {
  router.back();
};
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  padding: 32px;
  background: #f1f5f9;
}

.page-header {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  .title-section {
    display: flex;
    gap: 12px;
    align-items: center;
    .page-title {
      margin: 0;
      font-size: 26px;
      font-weight: 700;
      color: transparent;
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      -webkit-background-clip: text;
      background-clip: text;
    }
  }
  .back-btn {
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 40px;
    transition: all 0.2s;
    &:hover {
      background: #eef2ff;
      transform: translateX(-2px);
    }
  }
}

.card {
  margin-bottom: 24px;
  overflow: hidden;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: all 0.2s;
  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  }
  .card-header {
    padding: 20px 24px 0 24px;
    h3 {
      display: inline-block;
      padding-left: 12px;
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      border-left: 4px solid #3b82f6;
    }
  }
  :deep(.el-descriptions) {
    padding: 16px 24px 24px;
    .el-descriptions__label {
      font-weight: 500;
      background-color: #f8fafc;
    }
  }
}

.data-highlight {
  font-weight: 600;
  color: #3b82f6;
}

.completion-rate {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
}

.file-list {
  padding: 0 24px 24px;
  .file-item {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #edf2f7;
    transition: background 0.1s;
    &:hover {
      padding: 12px 8px;
      margin: 0 -8px;
      background: #f8fafc;
      border-radius: 12px;
    }
    .file-icon {
      font-size: 20px;
      color: #3b82f6;
    }
    .file-name {
      flex: 1;
      font-weight: 500;
    }
    .file-actions {
      display: flex;
      gap: 16px;
    }
  }
}

.ai-card {
  .score-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    padding: 20px 24px 0;
    .score-item {
      .score-label {
        margin-bottom: 8px;
        font-weight: 600;
        color: #1e293b;
      }
      .score-desc {
        margin-top: 6px;
        font-size: 12px;
        line-height: 1.4;
        color: #64748b;
      }
    }
  }

  .total-score-wrapper {
    padding: 20px 24px;
  }

  .total-score-card {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    align-items: center;
    justify-content: space-between;
    padding: 28px 32px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: 1px solid rgba(255, 255, 255, 0.5);
    border-radius: 28px;
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.02),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
    .total-score-left {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: baseline;
      .total-score-label {
        font-size: 18px;
        font-weight: 600;
        color: #475569;
        letter-spacing: 1px;
      }
      .total-score-value {
        font-size: 64px;
        font-weight: 800;
        line-height: 1;
        color: #3b82f6;
        letter-spacing: -2px;
      }
      .total-score-unit {
        align-self: flex-end;
        margin-bottom: 8px;
        font-size: 20px;
        font-weight: 500;
        color: #94a3b8;
      }
    }
    .total-score-right {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-end;
      .total-grade-badge {
        padding: 6px 24px;
        font-size: 20px;
        font-weight: 700;
        color: white;
        letter-spacing: 1px;
        background: #10b981;
        border-radius: 60px;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
      }
      .total-score-desc {
        max-width: 280px;
        font-size: 13px;
        line-height: 1.4;
        color: #64748b;
        text-align: right;
      }
    }
  }

  .analysis-report {
    padding: 0 24px 24px;
    h4 {
      margin: 0 0 16px;
      font-size: 17px;
      font-weight: 600;
    }
    .report-content {
      padding: 16px 20px;
      background: #fef9e6;
      border-radius: 20px;
      .report-line {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
        &:last-child {
          margin-bottom: 0;
        }
        .el-icon {
          margin-top: 2px;
          color: #e6a23c;
        }
        span {
          flex: 1;
          line-height: 1.5;
          color: #334155;
        }
      }
    }
  }
}

.action-footer {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  .el-button {
    padding: 12px 32px;
    font-weight: 500;
    border-radius: 40px;
  }
}

.pdf-preview-iframe {
  width: 100%;
  height: 70vh;
  border: none;
}

@media (max-width: 768px) {
  .detail-page {
    padding: 16px;
  }
  .score-grid {
    grid-template-columns: 1fr !important;
  }
  .total-score-card {
    flex-direction: column;
    align-items: flex-start !important;
    .total-score-right {
      align-items: flex-start !important;
      .total-score-desc {
        text-align: left;
      }
    }
  }
}
</style>
