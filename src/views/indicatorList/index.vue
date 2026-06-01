<template>
  <div class="indicator-page">
    <div class="card tab-card">
      <el-tabs v-model="activeTab" class="indicator-tabs">
        <!-- 指标列表 Tab -->
        <el-tab-pane label="指标列表" name="indicator">
          <!-- 列表视图（非详情模式） -->
          <div v-if="!showDetail">
            <!-- 搜索筛选栏 -->
            <div class="search-bar">
              <el-form inline>
                <el-form-item label="指标名称">
                  <el-input
                    v-model="searchForm.name"
                    placeholder="搜索指标名称"
                    clearable
                    :prefix-icon="Search"
                  />
                </el-form-item>
                <el-form-item style="width: 160px" label="指标模板">
                  <el-select v-model="searchForm.templateId" placeholder="全部模板" clearable>
                    <el-option label="全部" value="" />
                    <el-option
                      v-for="tpl in templates"
                      :key="tpl.id"
                      :label="tpl.name"
                      :value="tpl.id"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item style="width: 160px" label="全部状态">
                  <el-select v-model="searchForm.status" placeholder="全部状态">
                    <el-option label="全部" value="" />
                    <el-option label="已发布" value="已发布" />
                    <el-option label="草稿" value="草稿" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleSearch">搜索</el-button>
                  <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 指标表格 -->
            <el-table :data="filteredTableData" stripe style="width: 100%">
              <el-table-column prop="name" label="指标名称" min-width="150" />
              <el-table-column prop="templateName" label="指标模板" width="150">
                <template #default="{ row }">
                  {{ row.templateName || "未关联" }}
                </template>
              </el-table-column>
              <el-table-column prop="department" label="适用部门" width="140" />
              <el-table-column prop="deadline" label="截止日期" width="120" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <span class="status-tag" :class="statusClass(row.status)">
                    {{ row.status }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="260" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="handleDetail(row)">
                    详情
                  </el-button>
                  <template v-if="row.status === '草稿'">
                    <el-button link type="primary" size="small" @click="handleEdit(row)">
                      编辑
                    </el-button>
                    <el-button link type="danger" size="small" @click="handleDelete(row)">
                      删除
                    </el-button>
                    <el-button link type="success" size="small" @click="handlePublish(row)">
                      发布
                    </el-button>
                  </template>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 详情视图（非弹窗，页面内切换） -->
          <div v-else class="detail-view">
            <div class="detail-header">
              <el-button link class="back-btn" @click="backToList">
                <el-icon><ArrowLeft /></el-icon>
                返回
              </el-button>
              <h3>指标详情</h3>
            </div>
            <div class="detail-content">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="指标名称">
                  {{ currentDetail.name }}
                </el-descriptions-item>
                <el-descriptions-item label="关联模板">
                  {{ currentDetail.templateName || "未关联" }}
                </el-descriptions-item>
                <el-descriptions-item label="适用部门">
                  {{ currentDetail.department }}
                </el-descriptions-item>
                <el-descriptions-item label="截止日期">
                  {{ currentDetail.deadline }}
                </el-descriptions-item>
                <el-descriptions-item label="状态">
                  <span class="status-tag" :class="statusClass(currentDetail.status)">
                    {{ currentDetail.status }}
                  </span>
                </el-descriptions-item>
              </el-descriptions>

              <!-- 关联模板的自定义字段展示 -->
              <div v-if="currentTemplateDetail" class="template-fields">
                <h4>模板字段配置</h4>
                <div
                  v-for="field in currentTemplateDetail.fields"
                  :key="field.id"
                  class="field-item"
                >
                  <span class="field-label">{{ field.label || getFieldTypeName(field.type) }}</span>
                  <span class="field-type">（{{ getFieldTypeName(field.type) }}）</span>
                </div>
                <div v-if="!currentTemplateDetail.fields.length" class="empty-tip">
                  暂无自定义字段
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 模板列表 Tab（完整管理功能） -->
        <el-tab-pane label="模板列表" name="template">
          <div class="template-manager">
            <div class="template-header">
              <h3>模板列表</h3>
              <el-button type="primary" size="small" plain @click="openCreateTemplateDialog">
                + 新建模板
              </el-button>
            </div>
            <el-table :data="templates" stripe style="width: 100%">
              <el-table-column prop="name" label="模板名称" min-width="180" />
              <el-table-column prop="createTime" label="创建时间" width="180" />
              <el-table-column prop="updateTime" label="更新时间" width="180" />
              <el-table-column label="操作" width="220">
                <template #default="{ row }">
                  <el-button link type="primary" size="small" @click="openEditTemplateDialog(row)">
                    编辑
                  </el-button>
                  <el-button link type="danger" size="small" @click="deleteTemplate(row)">
                    删除
                  </el-button>
                  <el-button link type="info" size="small" @click="viewTemplateDetail(row)">
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 新建指标按钮（仅在指标列表 Tab 且非详情模式下显示） -->
      <el-button
        v-if="activeTab === 'indicator' && !showDetail"
        class="new-btn"
        type="primary"
        :icon="Plus"
        @click="openCreateDialog"
      >
        新建指标
      </el-button>
    </div>

    <!-- 新建/编辑指标弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      destroy-on-close
      @close="resetDialog"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="指标名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入指标名称" />
        </el-form-item>
        <el-form-item label="选择模板" prop="templateId">
          <el-select
            v-model="formData.templateId"
            placeholder="请选择模板"
            style="width: 100%"
            clearable
          >
            <el-option v-for="tpl in templates" :key="tpl.id" :label="tpl.name" :value="tpl.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="适用部门" prop="department">
          <el-select v-model="formData.department" placeholder="请选择适用部门" style="width: 100%">
            <el-option label="全部部门" value="全部部门" />
            <el-option label="指定部门" value="指定部门" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期" prop="deadline">
          <el-date-picker
            v-model="formData.deadline"
            type="date"
            placeholder="请选择截止日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 模板编辑弹窗 -->
    <el-dialog
      v-model="templateDialogVisible"
      :title="templateDialogTitle"
      width="600px"
      destroy-on-close
      @close="resetTemplateDialog"
    >
      <el-form
        ref="templateFormRef"
        :model="templateForm"
        :rules="templateRules"
        label-width="100px"
      >
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="templateForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="自定义字段">
          <div class="template-fields-editor">
            <div v-for="(field, idx) in templateForm.fields" :key="field.id" class="field-row">
              <el-select v-model="field.type" placeholder="字段类型" style="width: 100px">
                <el-option label="输入框" value="input" />
                <el-option label="文件上传" value="upload" />
                <el-option label="百分率" value="percent" />
              </el-select>
              <el-input v-model="field.label" placeholder="字段名称" style="flex: 1" />
              <el-button link type="danger" @click="removeTemplateField(idx)">删除</el-button>
            </div>
            <el-button type="primary" plain size="small" @click="addTemplateField">
              + 添加字段
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="templateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTemplate">保存</el-button>
      </template>
    </el-dialog>

    <!-- 模板详情弹窗 -->
    <el-dialog v-model="templateDetailVisible" title="模板详情" width="600px">
      <div v-if="currentTemplateDetail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="模板名称">
            {{ currentTemplateDetail.name }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ currentTemplateDetail.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ currentTemplateDetail.updateTime }}
          </el-descriptions-item>
          <el-descriptions-item label="自定义字段">
            <div
              v-for="field in currentTemplateDetail.fields"
              :key="field.id"
              style="margin-bottom: 8px"
            >
              <strong>{{ field.label || getFieldTypeName(field.type) }}</strong>
              （{{ getFieldTypeName(field.type) }}）
            </div>
            <div v-if="!currentTemplateDetail.fields?.length" style="color: #909399">
              暂无自定义字段
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="templateDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated, watch } from "vue";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import { useRouter } from "vue-router";

// ========== 类型定义 ==========
interface IndicatorItem {
  id: number;
  name: string;
  department: string;
  deadline: string;
  status: "已发布" | "草稿";
  templateId?: string;
  templateName?: string;
}

interface TemplateField {
  id: number;
  type: "input" | "upload" | "percent";
  label: string;
  numeratorLabel?: string;
  denominatorLabel?: string;
  resultLabel?: string;
}

interface TemplateItem {
  id: string;
  name: string;
  fields: TemplateField[];
  createTime: string;
  updateTime: string;
}

const router = useRouter();

// ========== 存储 KEY ==========
const INDICATOR_STORAGE_KEY = "indicator_list_data";
const TEMPLATE_STORAGE_KEY = "templates_list";

// ========== 模板数据 ==========
const templates = ref<TemplateItem[]>([]);
const loadTemplates = () => {
  const stored = localStorage.getItem(TEMPLATE_STORAGE_KEY);
  if (stored) {
    templates.value = JSON.parse(stored);
  } else {
    templates.value = [
      {
        id: "1",
        name: "立法指标考核模板",
        fields: [],
        createTime: "2026-06-01 10:00",
        updateTime: "2026-06-01 10:00",
      },
    ];
    saveTemplates();
  }
};
const saveTemplates = () => {
  localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates.value));
};
const getTemplateName = (templateId?: string) => {
  if (!templateId) return "";
  const tpl = templates.value.find((t) => t.id === templateId);
  return tpl ? tpl.name : "";
};
const syncIndicatorTemplateNames = () => {
  tableData.value.forEach((indicator) => {
    if (indicator.templateId) {
      const tpl = templates.value.find((t) => t.id === indicator.templateId);
      indicator.templateName = tpl ? tpl.name : "";
    } else {
      indicator.templateName = "";
    }
  });
  persistIndicators();
};

// ========== 指标数据 ==========
const getDefaultIndicators = (): IndicatorItem[] => [
  {
    id: 1,
    name: "法规实施率",
    department: "全部部门",
    deadline: "2026-03-31",
    status: "已发布",
    templateId: "1",
    templateName: "立法指标考核模板",
  },
  {
    id: 2,
    name: "预算执行率",
    department: "全部部门",
    deadline: "2026-03-31",
    status: "已发布",
    templateId: "1",
    templateName: "立法指标考核模板",
  },
  {
    id: 3,
    name: "政务公开满意度",
    department: "指定部门",
    deadline: "2026-04-15",
    status: "草稿",
    templateId: "",
    templateName: "",
  },
];

const loadIndicators = (): IndicatorItem[] => {
  const stored = localStorage.getItem(INDICATOR_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return getDefaultIndicators();
    }
  }
  return getDefaultIndicators();
};

const tableData = ref<IndicatorItem[]>(loadIndicators());
const persistIndicators = () => {
  localStorage.setItem(INDICATOR_STORAGE_KEY, JSON.stringify(tableData.value));
};

// 搜索
const searchForm = ref({
  name: "",
  templateId: "",
  status: "",
});

const filteredTableData = computed(() => {
  let list = [...tableData.value];
  if (searchForm.value.name) {
    list = list.filter((item) =>
      item.name.toLowerCase().includes(searchForm.value.name.toLowerCase())
    );
  }
  if (searchForm.value.templateId) {
    list = list.filter((item) => item.templateId === searchForm.value.templateId);
  }
  if (searchForm.value.status) {
    list = list.filter((item) => item.status === searchForm.value.status);
  }
  return list;
});

const statusClass = (status: string) => (status === "已发布" ? "status-published" : "status-draft");

const handleSearch = () => ElMessage.success("已筛选");
const resetSearch = () => {
  searchForm.value = { name: "", templateId: "", status: "" };
  ElMessage.info("已重置筛选条件");
};

// 指标详情视图切换
const showDetail = ref(false);
const currentDetail = ref<IndicatorItem | null>(null);
const currentTemplateDetail = ref<TemplateItem | null>(null);

const handleDetail = (row: IndicatorItem) => {
  router.push({
    path: "/indicator-detail",
    query: {
      id: row.id,
      name: row.name,
      status: row.status,
    },
  });
};

const backToList = () => {
  showDetail.value = false;
  currentDetail.value = null;
  currentTemplateDetail.value = null;
};

// 指标弹窗逻辑
const dialogVisible = ref(false);
const dialogTitle = ref("新建指标");
const isEditMode = ref(false);
const editingId = ref<number | null>(null);
const formRef = ref<FormInstance>();
const formData = ref({
  name: "",
  templateId: "",
  department: "",
  deadline: "",
});

const formRules: FormRules = {
  name: [{ required: true, message: "请输入指标名称", trigger: "blur" }],
  templateId: [{ required: true, message: "请选择指标模板", trigger: "change" }],
  department: [{ required: true, message: "请选择适用部门", trigger: "change" }],
  deadline: [{ required: true, message: "请选择截止日期", trigger: "change" }],
};

const getNextId = () => {
  if (tableData.value.length === 0) return 1;
  return Math.max(...tableData.value.map((item) => item.id)) + 1;
};

const openCreateDialog = () => {
  isEditMode.value = false;
  editingId.value = null;
  dialogTitle.value = "新建指标";
  formData.value = {
    name: "",
    templateId: "",
    department: "",
    deadline: "",
  };
  formRef.value?.clearValidate();
  dialogVisible.value = true;
};

const openEditDialog = (row: IndicatorItem) => {
  isEditMode.value = true;
  editingId.value = row.id;
  dialogTitle.value = "编辑指标";
  formData.value = {
    name: row.name,
    templateId: row.templateId || "",
    department: row.department,
    deadline: row.deadline,
  };
  formRef.value?.clearValidate();
  dialogVisible.value = true;
};

const resetDialog = () => {
  formRef.value?.resetFields();
  isEditMode.value = false;
  editingId.value = null;
};

const handleSave = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid) => {
    if (!valid) return ElMessage.error("请填写完整信息");

    const templateName = getTemplateName(formData.value.templateId);

    if (isEditMode.value && editingId.value !== null) {
      const index = tableData.value.findIndex((i) => i.id === editingId.value);
      if (index !== -1) {
        tableData.value[index] = {
          ...tableData.value[index],
          name: formData.value.name,
          templateId: formData.value.templateId,
          templateName,
          department: formData.value.department,
          deadline: formData.value.deadline,
        };
        persistIndicators();
        ElMessage.success("编辑成功");
        dialogVisible.value = false;
      }
    } else {
      const newIndicator: IndicatorItem = {
        id: getNextId(),
        name: formData.value.name,
        templateId: formData.value.templateId,
        templateName,
        department: formData.value.department,
        deadline: formData.value.deadline,
        status: "草稿",
      };
      tableData.value.push(newIndicator);
      persistIndicators();
      ElMessage.success("保存成功，当前为草稿状态");
      dialogVisible.value = false;
    }
  });
};

const handleEdit = (row: IndicatorItem) => openEditDialog(row);

const handleDelete = (row: IndicatorItem) => {
  ElMessageBox.confirm(`确定删除指标“${row.name}”吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const idx = tableData.value.findIndex((i) => i.id === row.id);
      if (idx !== -1) {
        tableData.value.splice(idx, 1);
        persistIndicators();
        ElMessage.success("删除成功");
      }
    })
    .catch(() => {});
};

const handlePublish = (row: IndicatorItem) => {
  ElMessageBox.confirm(`发布后指标“${row.name}”将变为已发布状态，确认吗？`, "提示", {
    confirmButtonText: "发布",
    cancelButtonText: "取消",
    type: "info",
  })
    .then(() => {
      row.status = "已发布";
      persistIndicators();
      ElMessage.success("发布成功");
    })
    .catch(() => {});
};

// ========== 模板管理 ==========
const templateDialogVisible = ref(false);
const templateDialogTitle = ref("新建模板");
const templateFormRef = ref<FormInstance>();
const templateForm = ref({
  id: "",
  name: "",
  fields: [] as TemplateField[],
});
const templateRules: FormRules = {
  name: [{ required: true, message: "请输入模板名称", trigger: "blur" }],
};
let editingTemplateId = "";

const openCreateTemplateDialog = () => {
  editingTemplateId = "";
  templateDialogTitle.value = "新建模板";
  templateForm.value = {
    id: "",
    name: "",
    fields: [],
  };
  templateDialogVisible.value = true;
};

const openEditTemplateDialog = (template: TemplateItem) => {
  editingTemplateId = template.id;
  templateDialogTitle.value = "编辑模板";
  templateForm.value = {
    id: template.id,
    name: template.name,
    fields: JSON.parse(JSON.stringify(template.fields)),
  };
  templateDialogVisible.value = true;
};

const addTemplateField = () => {
  templateForm.value.fields.push({
    id: Date.now(),
    type: "input",
    label: "",
  });
};
const removeTemplateField = (idx: number) => {
  templateForm.value.fields.splice(idx, 1);
};
const saveTemplate = async () => {
  if (!templateFormRef.value) return;
  await templateFormRef.value.validate((valid) => {
    if (!valid) return;
    const now = new Date();
    const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    if (editingTemplateId) {
      const index = templates.value.findIndex((t) => t.id === editingTemplateId);
      if (index !== -1) {
        templates.value[index] = {
          ...templates.value[index],
          name: templateForm.value.name,
          fields: templateForm.value.fields,
          updateTime: nowStr,
        };
        ElMessage.success("模板已更新");
      }
    } else {
      const newId = Date.now().toString();
      templates.value.push({
        id: newId,
        name: templateForm.value.name,
        fields: templateForm.value.fields,
        createTime: nowStr,
        updateTime: nowStr,
      });
      ElMessage.success("模板已创建");
    }
    saveTemplates();
    syncIndicatorTemplateNames();
    templateDialogVisible.value = false;
  });
};
const deleteTemplate = (template: TemplateItem) => {
  ElMessageBox.confirm(`确定删除模板“${template.name}”吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const idx = templates.value.findIndex((t) => t.id === template.id);
      if (idx !== -1) {
        templates.value.splice(idx, 1);
        saveTemplates();
        tableData.value.forEach((indicator) => {
          if (indicator.templateId === template.id) {
            indicator.templateId = "";
            indicator.templateName = "";
          }
        });
        persistIndicators();
        ElMessage.success("删除成功");
      }
    })
    .catch(() => {});
};
const templateDetailVisible = ref(false);
const viewTemplateDetail = (template: TemplateItem) => {
  currentTemplateDetail.value = template;
  templateDetailVisible.value = true;
};
const resetTemplateDialog = () => {
  templateForm.value = { id: "", name: "", fields: [] };
  templateFormRef.value?.clearValidate();
};
const getFieldTypeName = (type: string) => {
  const map: Record<string, string> = {
    input: "输入框",
    upload: "文件上传",
    percent: "百分率",
  };
  return map[type] || "未知";
};

// ========== Tab 切换 ==========
const activeTab = ref("indicator");

watch(
  templates,
  () => {
    syncIndicatorTemplateNames();
  },
  { deep: true }
);

onMounted(() => {
  loadTemplates();
  syncIndicatorTemplateNames();
});

onActivated(() => {
  loadTemplates();
  tableData.value = loadIndicators();
  syncIndicatorTemplateNames();
});
</script>

<style lang="scss" scoped>
.indicator-page {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 16px;
}
.card {
  overflow: hidden;
  background: var(--content-bg, #fff);
  border: 1px solid var(--border-color, #e4e7ed);
  border-radius: 10px;
}
.new-btn {
  position: absolute;
  top: 58px;
  right: 18px;
}
.tab-card {
  padding: 0;
}
.indicator-tabs :deep(.el-tabs__header) {
  padding: 0 20px;
  margin: 0 0 16px;
  border-bottom: 1px solid var(--border-color);
}
.indicator-tabs :deep(.el-tabs__content) {
  padding: 0 20px 20px;
}
.search-bar {
  margin-bottom: 20px;
}
.search-bar :deep(.el-form) {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}
.status-tag {
  display: inline-block;
  padding: 2px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 20px;
}
.status-tag.status-published {
  color: #67c23a;
  background-color: rgba(103, 194, 58, 0.1);
}
.status-tag.status-draft {
  color: #e6a23c;
  background-color: rgba(230, 162, 60, 0.1);
}
.template-manager {
  .template-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }
  }
}
.template-fields-editor {
  .field-row {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 12px;
  }
}

.detail-view {
  .detail-header {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 24px;
    .back-btn {
      font-size: 14px;
    }
    h3 {
      margin: 0;
    }
  }
  .detail-content {
    .template-fields {
      margin-top: 24px;
      h4 {
        margin: 0 0 12px;
        font-size: 16px;
        font-weight: 500;
      }
      .field-item {
        margin-bottom: 8px;
        .field-label {
          font-weight: 500;
        }
        .field-type {
          margin-left: 8px;
          font-size: 12px;
          color: #909399;
        }
      }
      .empty-tip {
        color: #909399;
      }
    }
  }
}
</style>
