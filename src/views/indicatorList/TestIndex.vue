<template>
  <div class="task-page">
    <!-- 筛选卡片（一行布局） -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">发布日期</span>
          <el-date-picker
            v-model="publishDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            size="small"
            class="date-picker"
          />
        </div>
        <div class="filter-item">
          <span class="filter-label">填报日期</span>
          <el-date-picker
            v-model="fillDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            size="small"
            class="date-picker"
          />
        </div>
        <div class="filter-item">
          <span class="filter-label">状态</span>
          <el-select
            v-model="statusFilter"
            placeholder="全部"
            clearable
            size="small"
            style="width: 100px"
          >
            <el-option label="全部" value="" />
            <el-option label="已完成" value="已完成" />
            <el-option label="待填报" value="待填报" />
          </el-select>
        </div>
        <div class="button-group">
          <el-button type="primary" size="small" @click="handleSearch">查询</el-button>
          <el-button size="small" @click="resetFilters">重置</el-button>
        </div>
      </div>
    </div>

    <!-- 表格卡片 -->
    <div class="table-card">
      <div class="table-header">
        <span class="table-title">指标列表</span>
        <span class="table-count">共 {{ filteredData.length }} 条记录</span>
      </div>
      <el-table :data="paginatedData" stripe style="width: 100%">
        <el-table-column prop="code" label="指标编号" width="140" />
        <el-table-column prop="name" label="指标名称" min-width="180" />
        <el-table-column prop="publishDate" label="发布日期" width="120" />
        <el-table-column prop="deadline" label="截止日期" width="120" />
        <el-table-column prop="fillDate" label="填报日期" width="120">
          <template #default="{ row }">
            {{ row.fillDate || "—" }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="statusClass(row.status)">
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === '已完成'"
              link
              type="primary"
              size="small"
              @click="handleDetail(row)"
            >
              详情
            </el-button>
            <el-button v-else link type="primary" size="small" @click="handleFill(row)">
              去填报
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import router from "@/router";

interface IndicatorTask {
  id: number;
  code: string;
  name: string;
  publishDate: string;
  deadline: string;
  fillDate: string | null;
  status: "已完成" | "待填报";
}

const mockData: IndicatorTask[] = [
  {
    id: 1,
    code: "ZB-2026-001",
    name: "立法工作指标考评",
    publishDate: "2026-05-15",
    deadline: "2026-06-15",
    fillDate: "2026-06-02",
    status: "已完成",
  },
  {
    id: 2,
    code: "ZB-2026-002",
    name: "监督工作指标考评",
    publishDate: "2026-05-20",
    deadline: "2026-06-20",
    fillDate: null,
    status: "待填报",
  },
  {
    id: 3,
    code: "ZB-2026-003",
    name: "代表建议办理考评",
    publishDate: "2026-05-22",
    deadline: "2026-06-22",
    fillDate: "2026-05-30",
    status: "已完成",
  },
  {
    id: 4,
    code: "ZB-2026-005",
    name: "人事任免工作考评",
    publishDate: "2026-06-01",
    deadline: "2026-07-01",
    fillDate: "2026-06-02",
    status: "已完成",
  },
  {
    id: 5,
    code: "ZB-2026-007",
    name: "规范性文件备案审查",
    publishDate: "2026-05-28",
    deadline: "2026-06-28",
    fillDate: "2026-06-01",
    status: "已完成",
  },
  {
    id: 6,
    code: "ZB-2026-008",
    name: "建议办理质量考评",
    publishDate: "2026-06-02",
    deadline: "2026-07-02",
    fillDate: null,
    status: "待填报",
  },
];

const tableData = ref<IndicatorTask[]>(mockData);

const publishDateRange = ref<[string, string] | null>(null);
const fillDateRange = ref<[string, string] | null>(null);
const statusFilter = ref("");

const currentPage = ref(1);
const pageSize = ref(10);

const filteredData = computed(() => {
  let result = [...tableData.value];

  if (publishDateRange.value && publishDateRange.value[0] && publishDateRange.value[1]) {
    const [start, end] = publishDateRange.value;
    result = result.filter((item) => item.publishDate >= start && item.publishDate <= end);
  }

  if (fillDateRange.value && fillDateRange.value[0] && fillDateRange.value[1]) {
    const [start, end] = fillDateRange.value;
    result = result.filter(
      (item) => item.fillDate !== null && item.fillDate >= start && item.fillDate <= end
    );
  }

  if (statusFilter.value) {
    result = result.filter((item) => item.status === statusFilter.value);
  }

  return result;
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

const handleSearch = () => {
  currentPage.value = 1;
  ElMessage.success("查询成功");
};

const resetFilters = () => {
  publishDateRange.value = null;
  fillDateRange.value = null;
  statusFilter.value = "";
  currentPage.value = 1;
  ElMessage.info("已重置筛选条件");
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
};
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

const handleDetail = () => {
  router.push("/fillin-detail");
};
const handleFill = () => {
  router.push("/fillin");
};

const statusClass = (status: string) => {
  return status === "已完成" ? "status-completed" : "status-pending";
};
</script>

<style lang="scss" scoped>
.task-page {
  min-height: 100vh;
  padding: 24px;
  background: #ffffff;
}

.filter-card {
  padding: 16px 20px;
  margin-bottom: 20px;
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-end;

  .filter-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    .filter-label {
      font-size: 13px;
      color: #606266;
    }
    .date-picker {
      width: 260px;
    }
  }

  .button-group {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    margin-left: auto;
  }
}

.table-card {
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 10px;

  .table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: #fafbfc;
    border-bottom: 1px solid #ebeef5;

    .table-title {
      font-size: 15px;
      font-weight: 500;
      color: #303133;
    }
    .table-count {
      font-size: 13px;
      color: #909399;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid #ebeef5;
  }
}

.status-tag {
  display: inline-block;
  padding: 2px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 20px;
}
.status-completed {
  color: #67c23a;
  background-color: rgba(103, 194, 58, 0.1);
}
.status-pending {
  color: #e6a23c;
  background-color: rgba(230, 162, 60, 0.1);
}

@media (max-width: 1100px) {
  .filter-row {
    .filter-item .date-picker {
      width: 220px;
    }
  }
}
@media (max-width: 900px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
    .button-group {
      justify-content: flex-end;
      margin-left: 0;
    }
  }
}
</style>
