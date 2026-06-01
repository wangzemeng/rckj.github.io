<template>
  <div class="dept-manage">
    <!-- 操作栏：包含搜索框和新建按钮 -->
    <div class="action-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索部门名称"
        clearable
        style="width: 260px"
        :prefix-icon="Search"
      />
      <div class="action-buttons">
        <el-button type="primary" @click="openCreateTypeDialog">
          <el-icon><FolderAdd /></el-icon>
          新建部门类型
        </el-button>
        <el-button type="success" @click="openCreateDeptDialog">
          <el-icon><Plus /></el-icon>
          新建部门
        </el-button>
      </div>
    </div>

    <!-- 主管理账号卡片 -->
    <div class="main-account-card">
      <div class="account-info">
        <div class="account-label">主管理账号</div>
        <div class="account-detail">
          <span class="dept-name">{{ mainAccount.name }}</span>
          <span class="account">账号：{{ mainAccount.account }}</span>
          <el-tag type="success" size="small">已启用</el-tag>
        </div>
      </div>
    </div>

    <!-- 部门类型分组（过滤后） -->
    <div v-for="type in filteredDepartmentTypes" :key="type.id" class="type-group">
      <div class="group-header">
        <div class="group-title">
          <span class="type-name">{{ type.name }}</span>
          <span class="dept-count">共 {{ getDeptCount(type.id) }} 个部门</span>
        </div>
        <div class="group-actions">
          <el-button link type="primary" size="small" @click="openEditTypeDialog(type)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button link type="danger" size="small" @click="deleteDepartmentType(type)">
            <el-icon><Delete /></el-icon>
            删除
          </el-button>
        </div>
      </div>
      <el-table :data="getFilteredDepartments(type.id)" stripe style="width: 100%">
        <el-table-column prop="name" label="部门名称" min-width="150" />
        <el-table-column prop="account" label="账号" min-width="180" />
        <el-table-column label="启用状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'danger'" size="small">
              {{ row.status === "启用" ? "已启用" : "已禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEditDeptDialog(row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="deleteDepartment(row)">
              删除
            </el-button>
            <el-button link type="info" size="small" @click="viewDepartmentDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 部门类型弹窗（新建/编辑） -->
    <el-dialog
      v-model="typeDialogVisible"
      :title="typeDialogTitle"
      width="500px"
      @close="resetTypeForm"
    >
      <el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="100px">
        <el-form-item label="部门类型名称" prop="name">
          <el-input
            v-model="typeForm.name"
            placeholder="例如: 政府类、财政类、政法类"
            maxlength="20"
            show-word-limit
          />
          <div class="form-tip">分类名称将用于分组管理下属部门</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDepartmentType">保存</el-button>
      </template>
    </el-dialog>

    <!-- 部门弹窗（新建/编辑） -->
    <el-dialog
      v-model="deptDialogVisible"
      :title="deptDialogTitle"
      width="550px"
      @close="resetDeptForm"
    >
      <el-form ref="deptFormRef" :model="deptForm" :rules="deptRules" label-width="100px">
        <el-form-item label="所属部门分类" prop="typeId">
          <el-select v-model="deptForm.typeId" placeholder="请选择部门分类" style="width: 100%">
            <el-option
              v-for="type in departmentTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="deptForm.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="账号">
          <el-input v-model="deptForm.account" placeholder="账号自动生成">
            <template #append>
              <el-button :disabled="!deptForm.typeId" @click="autoGenerateAccount">
                自动生成
              </el-button>
            </template>
          </el-input>
          <div class="form-tip">支持自动生成，也可手动修改</div>
        </el-form-item>
        <el-form-item v-if="!isEditMode" label="初始密码">
          <el-input v-model="deptForm.password" placeholder="初始密码" readonly show-password />
          <div class="form-tip">默认密码：{{ defaultPassword }}</div>
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch
            v-model="deptForm.status"
            active-value="启用"
            inactive-value="禁用"
            active-color="#13ce66"
          />
          <span class="status-text">{{ deptForm.status === "启用" ? "已启用" : "已禁用" }}</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deptDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDepartment">
          {{ isEditMode ? "保存修改" : "创建部门" }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 部门详情弹窗（只读） -->
    <el-dialog v-model="detailVisible" title="部门详情" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="部门名称">{{ detailDept.name }}</el-descriptions-item>
        <el-descriptions-item label="所属分类">
          {{ getTypeName(detailDept.typeId) }}
        </el-descriptions-item>
        <el-descriptions-item label="账号">{{ detailDept.account }}</el-descriptions-item>
        <el-descriptions-item label="启用状态">
          <el-tag :type="detailDept.status === '启用' ? 'success' : 'danger'">
            {{ detailDept.status === "启用" ? "已启用" : "已禁用" }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="detailDept.createTime" label="创建时间">
          {{ detailDept.createTime }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import { FolderAdd, Plus, Edit, Delete, Search } from "@element-plus/icons-vue";

// 类型定义
interface DepartmentType {
  id: string;
  name: string;
}

interface Department {
  id: string;
  typeId: string;
  name: string;
  account: string;
  password: string;
  status: "启用" | "禁用";
  createTime?: string;
}

// 数据存储key
const STORAGE_KEY_TYPES = "department_types";
const STORAGE_KEY_DEPTS = "departments";

// 主管理账号
const mainAccount = reactive({
  name: "省人大常委会办公厅",
  account: "srd_bgst",
  status: "启用",
});

// 部门类型列表
const departmentTypes = ref<DepartmentType[]>([]);
// 部门列表
const departments = ref<Department[]>([]);
// 搜索关键词
const searchKeyword = ref("");

// 默认密码
const defaultPassword = "Rdx#2024@pLm";

// 辅助函数
const saveData = () => {
  localStorage.setItem(STORAGE_KEY_TYPES, JSON.stringify(departmentTypes.value));
  localStorage.setItem(STORAGE_KEY_DEPTS, JSON.stringify(departments.value));
};

const loadData = () => {
  const storedTypes = localStorage.getItem(STORAGE_KEY_TYPES);
  if (storedTypes) {
    departmentTypes.value = JSON.parse(storedTypes);
  } else {
    departmentTypes.value = [
      { id: "1", name: "省政府" },
      { id: "2", name: "财政类" },
    ];
  }
  const storedDepts = localStorage.getItem(STORAGE_KEY_DEPTS);
  if (storedDepts) {
    departments.value = JSON.parse(storedDepts);
  } else {
    departments.value = [
      {
        id: "101",
        typeId: "1",
        name: "省政府办公厅",
        account: "gov_bgt_001",
        password: defaultPassword,
        status: "启用",
        createTime: "2024-01-01",
      },
      {
        id: "102",
        typeId: "1",
        name: "省公安厅",
        account: "gov_gat_005",
        password: defaultPassword,
        status: "启用",
        createTime: "2024-01-02",
      },
      {
        id: "103",
        typeId: "1",
        name: "省教育厅",
        account: "gov_jyt_003",
        password: defaultPassword,
        status: "启用",
        createTime: "2024-01-03",
      },
      {
        id: "104",
        typeId: "1",
        name: "省卫健委",
        account: "gov_wjw_004",
        password: defaultPassword,
        status: "禁用",
        createTime: "2024-01-04",
      },
      {
        id: "201",
        typeId: "2",
        name: "省财政厅",
        account: "fin_czt_001",
        password: defaultPassword,
        status: "启用",
        createTime: "2024-02-01",
      },
      {
        id: "202",
        typeId: "2",
        name: "省审计厅",
        account: "fin_sjt_002",
        password: defaultPassword,
        status: "启用",
        createTime: "2024-02-02",
      },
      {
        id: "203",
        typeId: "2",
        name: "省税务局",
        account: "fin_sjw_003",
        password: defaultPassword,
        status: "禁用",
        createTime: "2024-02-03",
      },
    ];
  }
};

// 过滤部门类型（有部门或本身匹配搜索）
const filteredDepartmentTypes = computed(() => {
  if (!searchKeyword.value) return departmentTypes.value;
  return departmentTypes.value.filter((type) => {
    const depts = departments.value.filter((d) => d.typeId === type.id);
    return depts.some((d) => d.name.includes(searchKeyword.value));
  });
});

// 获取某类型下过滤后的部门
const getFilteredDepartments = (typeId: string) => {
  let depts = departments.value.filter((d) => d.typeId === typeId);
  if (searchKeyword.value) {
    depts = depts.filter((d) => d.name.includes(searchKeyword.value));
  }
  return depts;
};

const getDeptCount = (typeId: string) => {
  return departments.value.filter((d) => d.typeId === typeId).length;
};

const getTypeName = (typeId: string) => {
  const type = departmentTypes.value.find((t) => t.id === typeId);
  return type ? type.name : "未知";
};

// 部门类型弹窗
const typeDialogVisible = ref(false);
const typeDialogTitle = ref("新建部门类型");
const typeFormRef = ref<FormInstance>();
const typeForm = reactive({ id: "", name: "" });
const typeRules: FormRules = {
  name: [{ required: true, message: "请输入部门类型名称", trigger: "blur" }],
};
let isEditTypeMode = false;

const openCreateTypeDialog = () => {
  isEditTypeMode = false;
  typeDialogTitle.value = "新建部门类型";
  typeForm.id = "";
  typeForm.name = "";
  typeDialogVisible.value = true;
};

const openEditTypeDialog = (type: DepartmentType) => {
  isEditTypeMode = true;
  typeDialogTitle.value = "编辑部门类型";
  typeForm.id = type.id;
  typeForm.name = type.name;
  typeDialogVisible.value = true;
};

const saveDepartmentType = async () => {
  if (!typeFormRef.value) return;
  await typeFormRef.value.validate((valid) => {
    if (!valid) return;
    if (isEditTypeMode) {
      const idx = departmentTypes.value.findIndex((t) => t.id === typeForm.id);
      if (idx !== -1) {
        departmentTypes.value[idx].name = typeForm.name;
        ElMessage.success("部门类型已更新");
      }
    } else {
      departmentTypes.value.push({ id: Date.now().toString(), name: typeForm.name });
      ElMessage.success("部门类型已创建");
    }
    saveData();
    typeDialogVisible.value = false;
  });
};

const deleteDepartmentType = (type: DepartmentType) => {
  if (getDeptCount(type.id) > 0) {
    ElMessage.warning(`该分类下还有部门，请先删除或转移部门`);
    return;
  }
  ElMessageBox.confirm(`确定删除分类“${type.name}”吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const idx = departmentTypes.value.findIndex((t) => t.id === type.id);
      if (idx !== -1) {
        departmentTypes.value.splice(idx, 1);
        saveData();
        ElMessage.success("删除成功");
      }
    })
    .catch(() => {});
};

const resetTypeForm = () => {
  typeForm.id = "";
  typeForm.name = "";
  typeFormRef.value?.clearValidate();
};

// 部门弹窗
const deptDialogVisible = ref(false);
const deptDialogTitle = ref("新建部门");
const deptFormRef = ref<FormInstance>();
const deptForm = reactive({
  id: "",
  typeId: "",
  name: "",
  account: "",
  password: defaultPassword,
  status: "启用" as "启用" | "禁用",
});
let isEditMode = false;
const deptRules: FormRules = {
  typeId: [{ required: true, message: "请选择所属部门分类", trigger: "change" }],
  name: [{ required: true, message: "请输入部门名称", trigger: "blur" }],
};

const autoGenerateAccount = () => {
  if (!deptForm.typeId) {
    ElMessage.warning("请先选择所属部门分类");
    return;
  }
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  let seq = 1;
  let newAccount = `dept_${dateStr}_${String(seq).padStart(3, "0")}`;
  while (departments.value.some((d) => d.account === newAccount)) {
    seq++;
    newAccount = `dept_${dateStr}_${String(seq).padStart(3, "0")}`;
  }
  deptForm.account = newAccount;
};

const openCreateDeptDialog = () => {
  isEditMode = false;
  deptDialogTitle.value = "新建部门";
  deptForm.id = "";
  deptForm.typeId = departmentTypes.value[0]?.id || "";
  deptForm.name = "";
  deptForm.account = "";
  deptForm.password = defaultPassword;
  deptForm.status = "启用";
  deptDialogVisible.value = true;
};

const openEditDeptDialog = (dept: Department) => {
  isEditMode = true;
  deptDialogTitle.value = "编辑部门";
  deptForm.id = dept.id;
  deptForm.typeId = dept.typeId;
  deptForm.name = dept.name;
  deptForm.account = dept.account;
  deptForm.password = dept.password;
  deptForm.status = dept.status;
  deptDialogVisible.value = true;
};

const saveDepartment = async () => {
  if (!deptFormRef.value) return;
  await deptFormRef.value.validate((valid) => {
    if (!valid) return;
    if (isEditMode) {
      const idx = departments.value.findIndex((d) => d.id === deptForm.id);
      if (idx !== -1) {
        departments.value[idx] = {
          ...departments.value[idx],
          typeId: deptForm.typeId,
          name: deptForm.name,
          account: deptForm.account,
          status: deptForm.status,
        };
        ElMessage.success("部门信息已更新");
      }
    } else {
      if (!deptForm.account) autoGenerateAccount();
      if (!deptForm.account) {
        ElMessage.warning("请填写账号或点击自动生成");
        return;
      }
      if (departments.value.some((d) => d.account === deptForm.account)) {
        ElMessage.warning("账号已存在，请重新填写");
        return;
      }
      departments.value.push({
        id: Date.now().toString(),
        typeId: deptForm.typeId,
        name: deptForm.name,
        account: deptForm.account,
        password: deptForm.password,
        status: deptForm.status,
        createTime: new Date().toLocaleDateString(),
      });
      ElMessage.success("部门创建成功");
    }
    saveData();
    deptDialogVisible.value = false;
  });
};

const deleteDepartment = (dept: Department) => {
  ElMessageBox.confirm(`确定删除部门“${dept.name}”吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      const idx = departments.value.findIndex((d) => d.id === dept.id);
      if (idx !== -1) {
        departments.value.splice(idx, 1);
        saveData();
        ElMessage.success("删除成功");
      }
    })
    .catch(() => {});
};

const resetDeptForm = () => {
  deptForm.id = "";
  deptForm.typeId = "";
  deptForm.name = "";
  deptForm.account = "";
  deptForm.password = defaultPassword;
  deptForm.status = "启用";
  deptFormRef.value?.clearValidate();
};

// 详情
const detailVisible = ref(false);
const detailDept = ref<Department>({} as Department);
const viewDepartmentDetail = (dept: Department) => {
  detailDept.value = dept;
  detailVisible.value = true;
};

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.dept-manage {
  min-height: 100%;
  padding: 24px;
  background: var(--el-bg-color-page);
}

.action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  .action-buttons {
    display: flex;
    gap: 12px;
  }
}

.main-account-card {
  padding: 20px 24px;
  margin-bottom: 24px;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  .account-info {
    .account-label {
      margin-bottom: 8px;
      font-size: 14px;
      opacity: 0.9;
    }
    .account-detail {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      align-items: center;
      .dept-name {
        font-size: 20px;
        font-weight: 600;
      }
      .account {
        padding: 4px 10px;
        font-family: monospace;
        font-size: 14px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 20px;
      }
    }
  }
}

.type-group {
  margin-bottom: 24px;
  overflow: hidden;
  background: var(--el-bg-color);
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  .group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: var(--el-fill-color-light);
    border-bottom: 1px solid var(--el-border-color-lighter);
    .group-title {
      display: flex;
      gap: 12px;
      align-items: baseline;
      .type-name {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
      .dept-count {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
    .group-actions {
      display: flex;
      gap: 8px;
    }
  }
  :deep(.el-table) {
    border-radius: 0;
  }
}

.status-text {
  margin-left: 8px;
  font-size: 12px;
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

:deep(.el-dialog) {
  .el-dialog__body {
    padding: 20px;
  }
  .el-form-item {
    margin-bottom: 18px;
  }
}
</style>
