<template>
  <div class="template-list-page">
    <div class="list-header">
      <h3 class="list-title">模板列表</h3>
      <el-button type="primary" :icon="Plus" @click="createNewTemplate">新建模板</el-button>
    </div>

    <div class="table-wrapper">
      <el-table :data="templates" stripe class="template-table">
        <el-table-column prop="name" label="模板名称" min-width="180" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="editTemplate(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="deleteTemplate(row)">删除</el-button>
            <el-button link type="info" size="small" @click="viewDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="模板详情" width="600px">
      <div v-if="currentTemplate">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="模板名称">{{ currentTemplate.name }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ currentTemplate.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ currentTemplate.updateTime }}
          </el-descriptions-item>
          <el-descriptions-item label="自定义字段">
            <div v-for="field in currentTemplate.fields" :key="field.id" style="margin-bottom: 8px">
              <strong>{{ field.label || getFieldTypeName(field.type) }}</strong>
              （{{ getFieldTypeName(field.type) }}）
            </div>
            <div v-if="!currentTemplate.fields?.length" style="color: #909399">暂无自定义字段</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑器覆盖层 -->
    <div v-if="showEditor" class="editor-overlay" @click.self="closeEditor">
      <div class="editor-container">
        <TemplateConfig
          :initial-template="editingTemplate"
          @save="onTemplateSaved"
          @cancel="closeEditor"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import TemplateConfig from "./TemplateConfig.vue";

interface Template {
  id: string;
  name: string;
  fields: any[];
  createTime: string;
  updateTime: string;
}

const STORAGE_KEY = "templates_list";
const templates = ref<Template[]>([]);
const detailVisible = ref(false);
const currentTemplate = ref<Template | null>(null);
const showEditor = ref(false);
const editingTemplate = ref<Template | null>(null);

const loadTemplates = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    templates.value = JSON.parse(stored);
  } else {
    templates.value = [
      {
        id: "1",
        name: "立法指标考核",
        fields: [],
        createTime: "2026-06-01 17:15",
        updateTime: "2026-06-01 17:15",
      },
    ];
    saveTemplates();
  }
};

const saveTemplates = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates.value));
};

const createNewTemplate = () => {
  editingTemplate.value = null;
  showEditor.value = true;
};

const editTemplate = (template: Template) => {
  editingTemplate.value = template;
  showEditor.value = true;
};

const deleteTemplate = (template: Template) => {
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
        ElMessage.success("删除成功");
      }
    })
    .catch(() => {});
};

const viewDetail = (template: Template) => {
  currentTemplate.value = template;
  detailVisible.value = true;
};

const closeEditor = () => {
  showEditor.value = false;
  editingTemplate.value = null;
};

const onTemplateSaved = (savedTemplate: Template) => {
  const index = templates.value.findIndex((t) => t.id === savedTemplate.id);
  if (index !== -1) {
    templates.value[index] = savedTemplate;
    ElMessage.success("模板已更新");
  } else {
    templates.value.push(savedTemplate);
    ElMessage.success("模板已创建");
  }
  saveTemplates();
  closeEditor();
};

const getFieldTypeName = (type: string) => {
  const map: Record<string, string> = {
    input: "输入框",
    upload: "文件上传",
    percent: "百分率",
  };
  return map[type] || "未知";
};

onMounted(() => {
  loadTemplates();
});
</script>

<style lang="scss" scoped>
.template-list-page {
  min-height: 100%;
  padding: 24px;
  background: #ffffff;
}
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  .list-title {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: #303133;
  }
}
.table-wrapper {
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
.template-table {
  width: 100%;
}
.editor-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  .editor-container {
    width: 90%;
    max-width: 1000px;
    height: 85%;
    overflow: auto;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}
</style>
