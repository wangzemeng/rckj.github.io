<template>
  <div class="notification-page">
    <!-- 页面头部：返回按钮 + 标题 + 未读数和全部已读 -->
    <div class="page-header">
      <div class="header-left">
        <el-button link class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>消息通知</h2>
      </div>
      <div class="header-actions">
        <span v-if="unreadCount > 0" class="unread-count">未读消息 {{ unreadCount }} 条</span>
        <span v-else class="unread-count zero">暂无未读消息</span>
        <el-button type="primary" size="small" @click="markAllAsRead">全部已读</el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <span class="filter-label">通知日期</span>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :default-value="[new Date(2026, 0, 1), new Date(2026, 5, 2)]"
            size="small"
            @change="handleFilterChange"
          />
        </div>
        <div class="filter-group">
          <span class="filter-label">状态</span>
          <el-radio-group v-model="statusFilter" size="small" @change="handleFilterChange">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="已发布">已发布</el-radio-button>
            <el-radio-button label="已撤回">已被撤回</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="message-card">
      <div class="message-list">
        <div
          v-for="msg in filteredMessages"
          :key="msg.id"
          class="message-item"
          :class="{ 'is-unread': msg.unread }"
        >
          <div class="msg-left">
            <div class="msg-title-line">
              <span class="msg-title">{{ msg.title }}</span>
              <span v-if="msg.unread" class="unread-badge">未读</span>
            </div>
            <div class="msg-meta">
              <el-tag
                :type="msg.status === '已发布' ? 'success' : 'danger'"
                size="small"
                effect="dark"
                class="status-tag"
              >
                {{ msg.status }}
              </el-tag>
              <span class="msg-time">{{ msg.time }}</span>
            </div>
          </div>
          <div class="msg-right">
            <div class="msg-content">{{ msg.content }}</div>
          </div>
        </div>
        <div v-if="filteredMessages.length === 0" class="empty-state">
          <el-empty description="暂无通知消息" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";

const router = useRouter();

interface Message {
  id: string;
  title: string;
  status: "已发布" | "已撤回";
  time: string;
  content: string;
  unread: boolean;
  date: string;
}

const messages = ref<Message[]>([
  {
    id: "1",
    title: "ZB-2026-001 立法指标考核",
    status: "已发布",
    time: "06-02 08:30",
    content: "请在2026-06-15前完成填报",
    unread: true,
    date: "2026-06-02",
  },
  {
    id: "2",
    title: "ZB-2026-003 监督工作考评",
    status: "已发布",
    time: "06-01 14:15",
    content: "请在2026-06-20前完成填报",
    unread: true,
    date: "2026-06-01",
  },
  {
    id: "3",
    title: "ZB-2026-005 代表履职评价",
    status: "已发布",
    time: "06-01 09:00",
    content: "请在2026-06-30前完成填报",
    unread: true,
    date: "2026-06-01",
  },
  {
    id: "4",
    title: "ZB-2026-002 预算审查监督",
    status: "已撤回",
    time: "05-30 16:45",
    content: "指标内容变更，已由上级撤回",
    unread: false,
    date: "2026-05-30",
  },
  {
    id: "5",
    title: "ZB-2026-004 建议办理质量",
    status: "已撤回",
    time: "05-28 10:20",
    content: "指标内容变更，已由上级撤回",
    unread: false,
    date: "2026-05-28",
  },
]);

const dateRange = ref<[string, string]>(["2026-01-01", "2026-06-02"]);
const statusFilter = ref("");

const unreadCount = computed(() => {
  return messages.value.filter((msg) => msg.unread).length;
});

const filteredMessages = computed(() => {
  let result = messages.value;
  const [startDate, endDate] = dateRange.value;
  if (startDate && endDate) {
    result = result.filter((msg) => msg.date >= startDate && msg.date <= endDate);
  }
  if (statusFilter.value) {
    result = result.filter((msg) => msg.status === statusFilter.value);
  }
  return [...result].sort((a, b) => b.date.localeCompare(a.date));
});

const handleFilterChange = () => {
  ElMessage.info("筛选条件已更新");
};

const markAllAsRead = () => {
  if (unreadCount.value === 0) {
    ElMessage.info("没有未读消息");
    return;
  }
  messages.value.forEach((msg) => {
    if (msg.unread) msg.unread = false;
  });
  ElMessage.success("已将所有消息标记为已读");
};

const goBack = () => {
  router.back();
};
</script>

<style lang="scss" scoped>
.notification-page {
  min-height: 100vh;
  padding: 24px;
  background: #f5f7fa;
}

.page-header {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  .header-left {
    display: flex;
    gap: 12px;
    align-items: center;
    .back-btn {
      padding: 0;
      font-size: 14px;
      .el-icon {
        font-size: 16px;
      }
    }
    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }
  }
  .header-actions {
    display: flex;
    gap: 16px;
    align-items: center;
    .unread-count {
      padding: 4px 12px;
      font-size: 13px;
      font-weight: 500;
      color: #dc2626;
      background: #fee2e2;
      border-radius: 30px;
      &.zero {
        color: #64748b;
        background: #e2e8f0;
      }
    }
  }
}

.filter-card {
  padding: 16px 24px;
  margin-bottom: 24px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    align-items: center;
    .filter-group {
      display: flex;
      gap: 12px;
      align-items: center;
      .filter-label {
        font-size: 14px;
        color: #5b6e8c;
      }
    }
  }
}

.message-card {
  padding: 20px 24px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  .message-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .message-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #edf2f7;
    transition: background 0.1s;
    &:last-child {
      border-bottom: none;
    }
    &.is-unread {
      padding: 12px 24px;
      margin: 0 -24px;
      background: #f8fafc;
      border-radius: 12px;
    }
    .msg-left {
      flex: 2;
      .msg-title-line {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 6px;
        .msg-title {
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
        }
        .unread-badge {
          padding: 2px 8px;
          font-size: 11px;
          color: white;
          background: #3b82f6;
          border-radius: 20px;
        }
      }
      .msg-meta {
        display: flex;
        gap: 12px;
        align-items: center;
        .status-tag {
          font-weight: 500;
        }
        .msg-time {
          font-size: 11px;
          color: #5b6e8c;
        }
      }
    }
    .msg-right {
      flex: 3;
      .msg-content {
        font-size: 13px;
        color: #334155;
      }
    }
  }
  .empty-state {
    padding: 40px 0;
  }
}

@media (max-width: 768px) {
  .filter-card .filter-row {
    flex-direction: column;
    align-items: stretch;
    .filter-group {
      justify-content: space-between;
    }
  }
  .message-item {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start !important;
    .msg-left,
    .msg-right {
      width: 100%;
    }
  }
}
</style>
