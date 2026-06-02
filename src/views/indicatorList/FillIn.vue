<template>
  <div class="fill-page">
    <!-- 头部返回 -->
    <div class="page-header">
      <el-button link class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2 class="page-title">指标填报</h2>
    </div>

    <!-- 指标信息卡片 -->
    <div class="info-card card">
      <div class="card-header">
        <h3>指标信息</h3>
        <el-tag type="warning" effect="plain" size="small">待填报</el-tag>
      </div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="指标编号">{{ indicatorData.code }}</el-descriptions-item>
        <el-descriptions-item label="指标名称">{{ indicatorData.name }}</el-descriptions-item>
        <el-descriptions-item label="发布日期">
          {{ indicatorData.publishDate }}
        </el-descriptions-item>
        <el-descriptions-item label="截止日期">{{ indicatorData.deadline }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 填报表单卡片（两列并排，标签在左） -->
    <div class="form-card card">
      <div class="card-header">
        <h3>填报信息</h3>
      </div>
      <el-form ref="formRef" :model="formData" :rules="formRules" class="fill-form">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="2026立法目标数量" prop="targetCount" required label-width="140px">
              <el-input-number
                v-model="formData.targetCount"
                :min="0"
                :precision="0"
                placeholder="请输入立法目标数量"
                controls-position="right"
                style="width: 260px"
              />
            </el-form-item>
          </el-col>
          <el-col :span="18">
            <el-form-item
              label="2026立法完成数量"
              prop="completedCount"
              required
              label-width="140px"
            >
              <el-input-number
                v-model="formData.completedCount"
                :min="0"
                :precision="0"
                placeholder="请输入实际立法完成数量"
                controls-position="right"
                style="width: 260px"
              />
            </el-form-item>
          </el-col>

          <el-col :span="6">
            <el-form-item label="完成率">
              <div class="completion-display">
                <span class="rate-value">{{ completionRate }}%</span>
                <span class="rate-tip">（完成率将根据目标数量和完成数量自动计算）</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <!-- 证明材料卡片 -->
    <div class="upload-card card">
      <div class="card-header">
        <h3>证明材料</h3>
      </div>
      <el-upload
        ref="uploadRef"
        drag
        multiple
        :auto-upload="false"
        :on-change="handleFileChange"
        :before-upload="beforeUpload"
        :file-list="fileList"
        action="#"
        class="simple-upload"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">点击或拖拽文件到此区域上传</div>
        <template #tip>
          <div class="el-upload__tip">支持 PDF、Word、Excel、图片格式，单个文件不超过 10MB</div>
        </template>
      </el-upload>
      <div v-if="fileList.length" class="file-list">
        <div v-for="(file, idx) in fileList" :key="file.uid" class="file-item">
          <span class="file-name">{{ file.name }}</span>
          <div class="file-actions">
            <el-button link type="primary" size="small" @click="previewFile(file)">预览</el-button>
            <el-button link type="danger" size="small" @click="removeFile(idx)">删除</el-button>
          </div>
        </div>
      </div>
      <div v-else class="empty-files">
        <el-empty description="尚未上传任何文件，请上传相关证明材料" :image-size="60" />
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="action-buttons">
      <el-button size="large" @click="cancel">取消</el-button>
      <el-button size="large" type="primary" plain @click="saveDraft">保存草稿</el-button>
      <el-button size="large" type="primary" @click="submitFill">提交填报</el-button>
    </div>

    <!-- PDF预览弹窗 -->
    <el-dialog v-model="previewVisible" title="文件预览" width="80%" top="5vh" destroy-on-close>
      <iframe :src="previewUrl" class="pdf-preview-iframe" frameborder="0"></iframe>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ElMessage,
  ElMessageBox,
  FormInstance,
  FormRules,
  UploadFile,
  UploadFiles,
} from "element-plus";
import { ArrowLeft, UploadFilled } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();

const indicatorId = route.query.id as string;

// 模拟指标基础数据
const indicatorData = ref({
  code: "ZB-2026-003",
  name: "2026年度立法工作完成情况",
  publishDate: "2026-03-15",
  deadline: "2026-06-30",
  status: "待填报",
});

const formData = ref({
  targetCount: undefined as number | undefined,
  completedCount: undefined as number | undefined,
});

const completionRate = computed(() => {
  const target = formData.value.targetCount;
  const completed = formData.value.completedCount;
  if (!target || target === 0) return 0;
  if (!completed) return 0;
  return Math.round((completed / target) * 100);
});

const formRules: FormRules = {
  targetCount: [
    { required: true, message: "请输入立法目标数量", trigger: "blur" },
    { type: "number", min: 1, message: "目标数量至少为1", trigger: "blur" },
  ],
  completedCount: [
    { required: true, message: "请输入立法完成数量", trigger: "blur" },
    { type: "number", min: 0, message: "完成数量不能小于0", trigger: "blur" },
  ],
};

const formRef = ref<FormInstance>();
const fileList = ref<UploadFile[]>([]);

const beforeUpload = (file: File) => {
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    ElMessage.error("文件大小不能超过 10MB!");
    return false;
  }
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
  ];
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error("仅支持 PDF、Word、Excel、图片格式!");
    return false;
  }
  return true;
};

const handleFileChange = (file: UploadFile, fileListNew: UploadFiles) => {
  fileList.value = fileListNew;
};

const removeFile = (index: number) => {
  fileList.value.splice(index, 1);
  ElMessage.success("文件已移除");
};

const previewFile = (file: UploadFile) => {
  if (file.url) {
    previewUrl.value = file.url;
    previewVisible.value = true;
  } else if (file.raw) {
    const url = URL.createObjectURL(file.raw);
    previewUrl.value = url;
    previewVisible.value = true;
  } else {
    ElMessage.warning("无法预览该文件");
  }
};

const previewVisible = ref(false);
const previewUrl = ref("");

const saveDraft = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch {
    ElMessage.warning("请正确填写填报数据");
    return;
  }
  const draft = {
    indicatorId,
    formData: formData.value,
    fileList: fileList.value.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    updateTime: new Date().toISOString(),
  };
  localStorage.setItem(`fill_draft_${indicatorId}`, JSON.stringify(draft));
  ElMessage.success("草稿已保存");
};

const submitFill = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch {
    ElMessage.warning("请正确填写填报数据");
    return;
  }
  if (fileList.value.length === 0) {
    ElMessage.warning("请至少上传一份证明材料");
    return;
  }
  // 模拟提交
  const allIndicators = JSON.parse(localStorage.getItem("indicator_task_list") || "[]");
  const index = allIndicators.findIndex((item: any) => item.id === indicatorId);
  if (index !== -1) {
    allIndicators[index].status = "已完成";
    allIndicators[index].fillDate = new Date().toISOString().slice(0, 10);
    localStorage.setItem("indicator_task_list", JSON.stringify(allIndicators));
  }
  localStorage.removeItem(`fill_draft_${indicatorId}`);
  ElMessage.success("提交成功！");
  router.back();
};

const cancel = () => {
  ElMessageBox.confirm("确定取消吗？未保存的数据将丢失", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      router.back();
    })
    .catch(() => {});
};

const loadDraft = () => {
  const draftStr = localStorage.getItem(`fill_draft_${indicatorId}`);
  if (draftStr) {
    try {
      const draft = JSON.parse(draftStr);
      formData.value = draft.formData;
      ElMessage.info("检测到未提交的草稿，已自动填充表单数据，请重新上传证明材料");
    } catch (e) {
      console.error(e);
    }
  }
};

const fetchIndicatorInfo = () => {
  if (indicatorId === "2") {
    indicatorData.value = {
      code: "ZB-2026-002",
      name: "监督工作指标考评",
      publishDate: "2026-05-20",
      deadline: "2026-06-20",
      status: "待填报",
    };
  } else if (indicatorId === "6") {
    indicatorData.value = {
      code: "ZB-2026-008",
      name: "建议办理质量考评",
      publishDate: "2026-06-02",
      deadline: "2026-07-02",
      status: "待填报",
    };
  } else {
    indicatorData.value = {
      code: "ZB-2026-003",
      name: "2026年度立法工作完成情况",
      publishDate: "2026-03-15",
      deadline: "2026-06-30",
      status: "待填报",
    };
  }
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  fetchIndicatorInfo();
  loadDraft();
});
</script>

<style lang="scss" scoped>
.fill-page {
  min-height: 100vh;
  padding: 24px;
  background: #f5f7fa;
}

.page-header {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
  .back-btn {
    padding: 6px 10px;
    font-size: 14px;
    &:hover {
      background: #eef2f6;
      border-radius: 20px;
    }
  }
  .page-title {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    color: #1e293b;
  }
}

.card {
  margin-bottom: 20px;
  overflow: hidden;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-bottom: 1px solid #ebeef5;
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
  :deep(.el-descriptions) {
    padding: 16px 20px;
    .el-descriptions__label {
      background-color: #fafbfc;
    }
  }
}

.fill-form {
  padding: 16px 20px;
  .el-form-item {
    margin-bottom: 20px;
    .el-form-item__label {
      font-weight: 500;
      color: #606266;
    }
  }
  .completion-display {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: baseline;
    .rate-value {
      font-size: 20px;
      font-weight: 600;
      color: #67c23a;
    }
    .rate-tip {
      font-size: 12px;
      color: #909399;
    }
  }
}

.upload-card {
  .simple-upload {
    width: 100%;
    padding: 16px 20px 0;
    :deep(.el-upload-dragger) {
      width: 100%;
      padding: 30px 20px;
      background: #fafbfc;
      border: 1px dashed #dcdfe6;
      border-radius: 8px;
      &:hover {
        border-color: #409eff;
      }
      .el-icon--upload {
        margin-bottom: 12px;
        font-size: 40px;
        color: #c0c4cc;
      }
    }
    .el-upload__tip {
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
      text-align: center;
    }
  }
  .file-list {
    padding: 0 20px 16px;
    .file-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #ebeef5;
      .file-name {
        font-size: 13px;
        color: #606266;
      }
      .file-actions {
        display: flex;
        gap: 12px;
      }
    }
  }
  .empty-files {
    padding: 0 20px 20px;
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
  .el-button {
    padding: 8px 24px;
    border-radius: 6px;
  }
}

.pdf-preview-iframe {
  width: 100%;
  height: 70vh;
  border: none;
}

@media (max-width: 768px) {
  .fill-page {
    padding: 16px;
  }
  .fill-form .el-row .el-col {
    margin-bottom: 16px;
  }
  .action-buttons {
    flex-direction: column;
    .el-button {
      width: 100%;
    }
  }
}
</style>
