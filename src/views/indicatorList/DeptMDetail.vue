<template>
  <div class="detail-page">
    <!-- 头部导航 -->
    <div class="page-header">
      <h2 class="page-title">{{ pageTitle }}</h2>
      <el-button link class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
    </div>

    <!-- 基础信息卡片 -->
    <div class="info-card">
      <h3>基础信息</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="指标名称">{{ detailData.indicatorName }}</el-descriptions-item>
        <el-descriptions-item label="填报部门">
          {{ detailData.departmentName.split(" ")[0] }}
          <el-tag size="small" type="info" style="margin-left: 8px">省级单位</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="填报时间">{{ detailData.submitTime }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 填报数据卡片 -->
    <div class="data-card">
      <h3>填报数据</h3>
      <div class="data-grid">
        <div class="data-item">
          <div class="data-label">2026年立法指标数量</div>
          <div class="data-value">{{ detailData.legislativeTarget }} 项</div>
        </div>
        <div class="data-item">
          <div class="data-label">2026年完成立法数量</div>
          <div class="data-value">{{ detailData.legislativeCompleted }} 项</div>
        </div>
        <div class="data-item">
          <div class="data-label">立法完成率</div>
          <div class="data-value highlight">{{ detailData.completionRate }}%</div>
        </div>
      </div>
    </div>

    <!-- 证明文件卡片 -->
    <div class="file-card">
      <h3>证明文件</h3>
      <div class="file-list">
        <div v-for="file in detailData.files" :key="file.name" class="file-item">
          <el-icon><Document /></el-icon>
          <span class="file-name">{{ file.name }}</span>
          <span class="file-meta">{{ file.size }} - {{ file.uploadTime }}</span>
          <div class="file-actions">
            <el-button link type="primary" size="small" @click="previewFile(file)">预览</el-button>
            <el-button link type="primary" size="small" @click="downloadFile(file)">下载</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- AI 智能审核卡片（紧凑布局） -->
    <div class="ai-card">
      <div class="ai-header">
        <h3>AI 智能审核</h3>
        <div class="score-wrapper">
          <span class="score-label">综合评分</span>
          <span class="score-value">
            {{ detailData.aiScore }}
            <span class="score-unit">分</span>
          </span>
          <span class="score-grade">{{ aiGrade }}</span>
        </div>
      </div>
      <div class="audit-conclusion">
        <h4>审核结论</h4>
        <ul>
          <li>
            <strong>数据完整性：</strong>
            {{ detailData.dataIntegrity }}
          </li>
          <li>
            <strong>数据合理性：</strong>
            {{ detailData.dataReasonableness }}
          </li>
          <li>
            <strong>证明文件：</strong>
            {{ detailData.fileComment }}
          </li>
          <li>
            <strong>时效性：</strong>
            {{ detailData.timeliness }}
          </li>
        </ul>
      </div>
      <div class="ai-summary">
        <h4>AI 审核总结</h4>
        <p>{{ detailData.aiSummary }}</p>
      </div>
    </div>

    <!-- 操作按钮（只保留退回按钮，带 tooltip） -->
    <div class="action-buttons">
      <el-tooltip content="退回后下级部门需重新提交" placement="top">
        <el-button type="warning" @click="handleReject">退回</el-button>
      </el-tooltip>
    </div>

    <!-- PDF 预览弹窗 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="文件预览"
      width="80%"
      top="5vh"
      destroy-on-close
      @close="closePreview"
    >
      <iframe
        v-if="previewUrl"
        :src="previewUrl"
        class="pdf-preview-iframe"
        frameborder="0"
      ></iframe>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowLeft, Document } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();

// 预览弹窗控制
const previewDialogVisible = ref(false);
const previewUrl = ref("");

const deptName = route.query.deptName as string;

// 模拟数据（请根据实际后端返回替换）
const detailData = ref({
  indicatorName: "立法指标考核",
  departmentName: "省公安厅 省级单位",
  submitTime: "2026-05-20 15:30",
  legislativeTarget: 12,
  legislativeCompleted: 11,
  completionRate: 91.7,
  files: [
    {
      name: "2026年度立法计划完成情况报告.pdf",
      size: "68.5 KB",
      uploadTime: "2026-05-18 上传",
      url: "../../../public/file/report.pdf",
    },
    {
      name: "立法项目统计数据汇总表.xlsx",
      size: "1.8 MB",
      uploadTime: "2026-05-19 上传",
      url: "../../../public/file/立法项目统计数据汇总表.xlsx",
    },
  ],
  aiScore: 92,
  dataIntegrity: "各项指标数据填报完整，无遗漏",
  dataReasonableness: "完成率 91.7% 高于全省平均水平",
  fileComment: "建议补充第三方审计报告",
  timeliness: "在规定时间内完成填报",
  aiSummary:
    "该单位立法指标整体完成度优秀，数据填报规范完整。建议关注证明文件的完整性，补充第三方审计材料后可达到满分标准。",
});

const pageTitle = computed(() => `${detailData.value.indicatorName} - ${deptName} 填报详情`);
const aiGrade = computed(() => {
  const score = detailData.value.aiScore;
  if (score >= 90) return "优秀";
  if (score >= 75) return "良好";
  if (score >= 60) return "合格";
  return "待改进";
});

const goBack = () => router.back();

// 预览文件（PDF 用弹窗 iframe）
const previewFile = (file: any) => {
  if (!file.url) {
    ElMessage.warning("文件地址无效");
    return;
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") {
    previewUrl.value = file.url;
    previewDialogVisible.value = true;
  } else {
    ElMessage.info(`预览功能暂不支持 ${ext} 格式，请下载后查看`);
  }
};

// 下载文件
const downloadFile = (file: any) => {
  if (!file.url) {
    ElMessage.warning("文件地址无效");
    return;
  }
  const link = document.createElement("a");
  link.href = file.url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  ElMessage.success(`正在下载：${file.name}`);
};

// 关闭预览
const closePreview = () => {
  previewUrl.value = "";
};

// 退回操作
const handleReject = () => {
  ElMessageBox.confirm("退回后该部门需要重新填报，确定退回吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      ElMessage.success("已退回，下级部门将收到重新填报通知");
      // 实际应调用接口
    })
    .catch(() => {});
};
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  padding: 24px;
  background: #f5f7fa;
}
.page-header {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  .back-btn {
    padding: 8px 12px;
    font-size: 14px;
    border-radius: 20px;
    &:hover {
      background: #eef2f6;
    }
  }
  .page-title {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    color: #1e293b;
  }
}
.info-card,
.data-card,
.file-card,
.ai-card {
  padding: 20px 24px;
  margin-bottom: 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  h3 {
    padding-left: 12px;
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
    border-left: 4px solid #3b82f6;
  }
}
.data-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  .data-item {
    flex: 1;
    padding: 16px;
    text-align: center;
    background: #f8fafc;
    border-radius: 16px;
    .data-label {
      margin-bottom: 8px;
      font-size: 14px;
      color: #5b6e8c;
    }
    .data-value {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      &.highlight {
        color: #3b82f6;
      }
    }
  }
}
.file-list {
  .file-item {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #edf2f7;
    &:last-child {
      border-bottom: none;
    }
    .file-name {
      flex: 1;
      font-weight: 500;
    }
    .file-meta {
      font-size: 12px;
      color: #5b6e8c;
    }
    .file-actions {
      display: flex;
      gap: 8px;
    }
  }
}
.ai-card {
  .ai-header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 20px;
    h3 {
      margin-bottom: 0;
    }
    .score-wrapper {
      display: flex;
      gap: 12px;
      align-items: baseline;
      padding: 6px 16px;
      background: #f1f5f9;
      border-radius: 40px;
      .score-label {
        font-size: 14px;
        color: #1e293b;
      }
      .score-value {
        font-size: 24px;
        font-weight: 700;
        color: #3b82f6;
        .score-unit {
          font-size: 13px;
          font-weight: 400;
        }
      }
      .score-grade {
        padding: 2px 10px;
        font-size: 13px;
        font-weight: 500;
        color: #10b981;
        background: #d1fae5;
        border-radius: 30px;
      }
    }
  }
  .audit-conclusion {
    margin-bottom: 20px;
    h4 {
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 600;
    }
    ul {
      padding-left: 0;
      margin: 0;
      list-style: none;
      li {
        margin-bottom: 8px;
        line-height: 1.5;
        strong {
          font-weight: 600;
        }
      }
    }
  }
  .ai-summary {
    padding: 12px 20px;
    background: #fef9e6;
    border-radius: 16px;
    h4 {
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 600;
    }
    p {
      margin: 0;
      line-height: 1.5;
    }
  }
}
.action-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
.pdf-preview-iframe {
  width: 100%;
  height: 70vh;
  border: none;
}
</style>
