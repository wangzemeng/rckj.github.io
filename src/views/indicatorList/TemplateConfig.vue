<template>
  <div class="template-page">
    <!-- 模版基本信息 -->
    <div class="card">
      <div class="card__head">
        <h3 class="card__title">模版基本信息</h3>
      </div>
      <div class="card__body">
        <el-form label-position="top">
          <el-form-item label="模版名称" required>
            <el-input
              v-model="templateName"
              placeholder="请输入模版名称，如：立法指标考核模版"
              maxlength="50"
              show-word-limit
            />
            <div class="form-tip">模版名称将显示在下级部门填报界面，建议简洁明了</div>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 自定义字段 -->
    <div class="card">
      <div class="card__head">
        <h3 class="card__title">自定义字段</h3>
        <el-button type="primary" size="small" plain @click="showFieldTypeDialog">
          + 添加字段
        </el-button>
      </div>
      <div class="card__body">
        <div class="field-tip">
          点击上方按钮添加字段，支持输入框、文件上传、百分率三种类型。使用上下箭头可调整顺序。
        </div>

        <div v-if="fields.length === 0" class="empty-fields">暂无自定义字段，点击上方按钮添加</div>
        <div v-else class="fields-list">
          <div v-for="(field, idx) in fields" :key="field.id" class="field-item">
            <!-- 箭头按钮组 -->
            <div class="field-item__drag">
              <el-button link :disabled="idx === 0" class="drag-btn" @click="moveUp(idx)">
                <el-icon><ArrowUp /></el-icon>
              </el-button>
              <el-button
                link
                :disabled="idx === fields.length - 1"
                class="drag-btn"
                @click="moveDown(idx)"
              >
                <el-icon><ArrowDown /></el-icon>
              </el-button>
            </div>

            <div class="field-item__content">
              <!-- 输入框类型 -->
              <template v-if="field.type === 'input'">
                <div class="field-config">
                  <div class="config-row">
                    <div class="config-label">字段名称</div>
                    <el-input v-model="field.label" placeholder="例如：立法目标数量" size="small" />
                  </div>
                  <div class="preview-row">
                    <div class="preview-label">预览：</div>
                    <el-input
                      :placeholder="`请输入${field.label || '内容'}`"
                      disabled
                      size="small"
                    />
                  </div>
                </div>
              </template>

              <!-- 文件上传类型 -->
              <template v-if="field.type === 'upload'">
                <div class="field-config">
                  <div class="config-row">
                    <div class="config-label">字段名称</div>
                    <el-input v-model="field.label" placeholder="例如：佐证材料" size="small" />
                  </div>
                  <div class="preview-row">
                    <div class="preview-label">预览：</div>
                    <div class="upload-preview-static">
                      <div class="static-upload-drag">
                        <el-icon class="static-icon"><UploadFilled /></el-icon>
                        <div class="static-text">点击或拖拽上传文件</div>
                      </div>
                      <div v-if="field.sampleFile" class="static-file">{{ field.sampleFile }}</div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- 百分率类型 -->
              <template v-if="field.type === 'percent'">
                <div class="field-config">
                  <div class="config-row">
                    <div class="config-label">分子名称</div>
                    <el-input
                      v-model="field.numeratorLabel"
                      placeholder="例如：立法完成数量"
                      size="small"
                    />
                  </div>
                  <div class="config-row">
                    <div class="config-label">分母名称</div>
                    <el-input
                      v-model="field.denominatorLabel"
                      placeholder="例如：立法目标数量"
                      size="small"
                    />
                  </div>
                  <div class="config-row">
                    <div class="config-label">结果名称</div>
                    <el-input v-model="field.resultLabel" placeholder="例如：完成率" size="small" />
                  </div>
                  <div class="preview-row">
                    <div class="preview-label">预览：</div>
                    <div class="percent-preview-static">
                      <span class="static-label">{{ field.numeratorLabel || "分子" }}</span>
                      <span class="static-value">0</span>
                      <span class="static-label">{{ field.denominatorLabel || "分母" }}</span>
                      <span class="static-value">0</span>
                      <span class="static-label">结果：</span>
                      <span class="static-result">0%</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <div class="field-item__actions">
              <el-button link type="danger" class="delete-btn" @click="removeField(idx)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="action-buttons">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" plain @click="previewTemplate">预览模版</el-button>
      <el-button type="primary" @click="saveTemplate">保存模版</el-button>
    </div>

    <!-- 添加字段类型选择弹窗 -->
    <el-dialog
      v-model="typeDialogVisible"
      title="选择字段类型"
      width="500px"
      class="type-select-dialog"
    >
      <div class="type-cards">
        <div
          v-for="option in typeOptions"
          :key="option.value"
          class="type-card"
          :class="{ active: selectedType === option.value }"
          @click="selectedType = option.value"
        >
          <div class="type-icon">
            <el-icon :size="28"><component :is="option.icon" /></el-icon>
          </div>
          <div class="type-info">
            <div class="type-name">{{ option.label }}</div>
            <div class="type-desc">{{ option.desc }}</div>
          </div>
          <div class="type-check">
            <el-icon v-if="selectedType === option.value" color="#409EFF">
              <CircleCheckFilled />
            </el-icon>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="typeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addFieldByType">确定</el-button>
      </template>
    </el-dialog>

    <!-- 预览弹窗 -->
    <el-dialog v-model="previewVisible" title="模版预览" width="700px">
      <div class="preview-content">
        <h4>模版名称：{{ templateName || "未命名" }}</h4>
        <div v-for="field in fields" :key="field.id" class="preview-field">
          <div class="preview-field__label">{{ getFieldDisplayName(field) }}</div>
          <div class="preview-field__value">
            <template v-if="field.type === 'input'">[文本输入框]</template>
            <template v-if="field.type === 'upload'">[文件上传]</template>
            <template v-if="field.type === 'percent'">
              {{ field.numeratorLabel || "?" }} / {{ field.denominatorLabel || "?" }} = ?
            </template>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  ArrowUp,
  ArrowDown,
  Delete,
  UploadFilled,
  EditPen,
  TrendCharts,
  CircleCheckFilled,
} from "@element-plus/icons-vue";

// ---------- Props & Emits ----------
interface FieldItem {
  id: number;
  type: "input" | "upload" | "percent";
  label: string;
  sampleFile?: string;
  numeratorLabel?: string;
  denominatorLabel?: string;
  resultLabel?: string;
}

interface TemplateData {
  id: string;
  name: string;
  fields: FieldItem[];
  createTime?: string;
  updateTime?: string;
}

const props = defineProps<{
  initialTemplate?: TemplateData | null;
}>();

const emit = defineEmits<{
  (e: "save", template: TemplateData): void;
  (e: "cancel"): void;
}>();

// ---------- 表单数据 ----------
const templateName = ref("");
const fields = ref<FieldItem[]>([]);
let editingId = ""; // 编辑时的模板id（新建为空）

// 类型选项
const typeOptions = [
  { value: "input", label: "输入框", desc: "单行文本输入，适合填写简短内容", icon: EditPen },
  {
    value: "upload",
    label: "文件上传",
    desc: "支持拖拽上传，可上传图片、文档等",
    icon: UploadFilled,
  },
  { value: "percent", label: "百分率", desc: "自动计算分子/分母百分比", icon: TrendCharts },
];

// 弹窗
const typeDialogVisible = ref(false);
const selectedType = ref<"input" | "upload" | "percent">("input");
const previewVisible = ref(false);

// ---------- 初始化（编辑模式时填充数据）----------
onMounted(() => {
  if (props.initialTemplate) {
    templateName.value = props.initialTemplate.name;
    fields.value = props.initialTemplate.fields || [];
    editingId = props.initialTemplate.id;
  }
});

// ---------- 字段操作 ----------
const showFieldTypeDialog = () => {
  selectedType.value = "input";
  typeDialogVisible.value = true;
};

const addFieldByType = () => {
  const type = selectedType.value;
  const newField: FieldItem = {
    id: Date.now(),
    type,
    label: "",
  };
  if (type === "input") {
    // 无额外字段
  } else if (type === "upload") {
    newField.sampleFile = "";
  } else if (type === "percent") {
    newField.numeratorLabel = "";
    newField.denominatorLabel = "";
    newField.resultLabel = "完成率";
  }
  fields.value.push(newField);
  typeDialogVisible.value = false;
  ElMessage.success("添加成功，可调整顺序");
};

const removeField = (index: number) => {
  fields.value.splice(index, 1);
  ElMessage.success("已删除");
};

const moveUp = (index: number) => {
  if (index === 0) return;
  const temp = fields.value[index - 1];
  fields.value[index - 1] = fields.value[index];
  fields.value[index] = temp;
};

const moveDown = (index: number) => {
  if (index === fields.value.length - 1) return;
  const temp = fields.value[index + 1];
  fields.value[index + 1] = fields.value[index];
  fields.value[index] = temp;
};

const getFieldDisplayName = (field: FieldItem) => {
  if (field.label) return field.label;
  if (field.type === "input") return "输入框";
  if (field.type === "upload") return "文件上传";
  if (field.type === "percent") return "百分率";
  return "未命名";
};

// 预览
const previewTemplate = () => {
  if (!templateName.value.trim()) {
    ElMessage.warning("请填写模版名称");
    return;
  }
  if (fields.value.length === 0) {
    ElMessage.warning("请至少添加一个自定义字段");
    return;
  }
  previewVisible.value = true;
};

// 保存（emit 给父组件）
const saveTemplate = () => {
  if (!templateName.value.trim()) {
    ElMessage.warning("请填写模版名称");
    return;
  }
  if (fields.value.length === 0) {
    ElMessage.warning("请至少添加一个自定义字段");
    return;
  }

  // 深拷贝字段配置，去掉预览辅助字段（sampleFile）
  const savedFields = fields.value.map((field) => {
    if (field.type === "upload") {
      const { ...rest } = field;
      return rest;
    }
    return field;
  });

  const now = new Date();
  const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
  const templateData: TemplateData = {
    id: editingId || Date.now().toString(),
    name: templateName.value,
    fields: savedFields,
    createTime: props.initialTemplate?.createTime || nowStr,
    updateTime: nowStr,
  };
  emit("save", templateData);
};

// 取消（emit）
const cancel = () => {
  ElMessageBox.confirm("确定取消吗？未保存的内容将丢失", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      emit("cancel");
    })
    .catch(() => {});
};
</script>

<style lang="scss" scoped>
/* 样式与之前完全一致，此处省略（同上一个版本） */
.template-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
}

.card {
  overflow: hidden;
  background: var(--content-bg, #fff);
  border: 1px solid var(--border-color, #e4e7ed);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-color, #e4e7ed);
}

.card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.card__body {
  padding: 20px;
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.field-tip {
  padding: 8px 12px;
  margin-bottom: 20px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.fields-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 12px;
  transition: background 0.2s;
  &:hover {
    background: var(--el-fill-color-light);
  }
}

.field-item__drag {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 6px;
  .drag-btn {
    padding: 4px;
    margin: 0;
    .el-icon {
      font-size: 16px;
    }
  }
}

.field-item__content {
  flex: 1;
  min-width: 0;
}

.field-config {
  .config-row {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 12px;
    .config-label {
      flex-shrink: 0;
      width: 70px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
    .el-input {
      flex: 1;
    }
  }
  .preview-row {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-top: 8px;
    .preview-label {
      flex-shrink: 0;
      width: 70px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
    .el-input,
    .upload-preview-static,
    .percent-preview-static {
      flex: 1;
    }
  }
}

.upload-preview-static {
  .static-upload-drag {
    padding: 16px;
    text-align: center;
    cursor: default;
    background: var(--el-fill-color-light);
    border: 1px dashed var(--border-color, #d9d9d9);
    border-radius: 8px;
    .static-icon {
      margin-bottom: 8px;
      font-size: 28px;
      color: var(--el-text-color-placeholder);
    }
    .static-text {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
  .static-file {
    display: inline-block;
    padding: 4px 8px;
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color);
    border-radius: 4px;
  }
}

.percent-preview-static {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  .static-label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
  .static-value {
    min-width: 40px;
    padding: 2px 8px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    text-align: center;
    background: var(--el-fill-color);
    border-radius: 4px;
  }
  .static-result {
    font-weight: 600;
    color: var(--el-color-primary);
  }
}

.field-item__actions {
  display: flex;
  align-items: center;
  .delete-btn {
    padding: 4px;
  }
}

.empty-fields {
  padding: 40px 0;
  color: var(--el-text-color-placeholder);
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

.type-select-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 24px;
  }
}

.type-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.type-card {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--border-color, #e4e7ed);
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
  }

  &.active {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
  }

  .type-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color-light);
    border-radius: 12px;
  }

  .type-info {
    flex: 1;
  }

  .type-name {
    margin-bottom: 4px;
    font-size: 15px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .type-desc {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .type-check {
    flex-shrink: 0;
    .el-icon {
      font-size: 20px;
    }
  }
}

.preview-content {
  h4 {
    margin-top: 0;
    margin-bottom: 20px;
  }
  .preview-field {
    padding-bottom: 12px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--border-color, #e4e7ed);
    &__label {
      margin-bottom: 6px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
    &__value {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
