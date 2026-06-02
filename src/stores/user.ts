import { store } from "@/stores";

import AuthAPI from "@/api/auth";
import UserAPI from "@/api/system/user";
import type { LoginRequest } from "@/api/auth";
import type { UserInfo } from "@/api/system/user";

import { AuthStorage } from "@/utils/auth";
import { usePermissionStoreHook } from "@/stores/permission";
import { useDictStoreHook } from "@/stores/dict";
import { useTagsViewStore } from "@/stores";
import { cleanupSseServices } from "@/composables";

export const useUserStore = defineStore("user", () => {
  // 用户信息
  const userInfo = ref<UserInfo>({} as UserInfo);
  // 记住我状态
  const rememberMe = ref(AuthStorage.getRememberMe());

  /**
   * 登录
   */
  async function login(loginRequest: LoginRequest): Promise<void> {
    if (userInfo.value.username !== "admin") {
      userInfo.value = {
        id: "3",
        username: "test",
        nickname: "部门管理员",
        mobile: "17621210366",
        gender: 1,
        avatar: "https://foruda.gitee.com/images/1723603502796844527/03cdca2a_716974.gif",
        email: "youlaitech@163.com",
        status: 1,
        deptId: "3",
        roleIds: [4],
      };
    }
    const { accessToken, refreshToken } = {
      accessToken:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImRlcHRJZCI6MSwiZGF0YVNjb3BlIjoxLCJ1c2VySWQiOjIsImlhdCI6MTcyODE5MzA1MiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9BRE1JTiJdLCJqdGkiOiJhZDg3NzlhZDZlYWY0OWY3OTE4M2ZmYmI5OWM4MjExMSJ9.58YHwL3sNNC22jyAmOZeSm-7MITzfHb_epBIz7LvWeA",
      refreshToken:
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImRlcHRJZCI6MSwiZGF0YVNjb3BlIjoxLCJ1c2VySWQiOjIsImlhdCI6MTcyODE5MzA1MiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9BRE1JTiJdLCJqdGkiOiJhZDg3NzlhZDZlYWY0OWY3OTE4M2ZmYmI5OWM4MjExMSJ9.58YHwL3sNNC22jyAmOZeSm-7MITzfHb_epBIz7LvWeA",
    };
    rememberMe.value = loginRequest.rememberMe ?? false;
    AuthStorage.setTokens(accessToken, refreshToken, rememberMe.value);
  }

  let refreshPromise: Promise<void> | null = null;

  /**
   * 刷新 token（单飞模式）
   *
   * 多个并发请求遇到 token 过期时，共享同一次 refresh 请求。
   */
  function refreshTokenOnce(): Promise<void> {
    if (refreshPromise) return refreshPromise;

    refreshPromise = doRefreshToken().finally(() => {
      refreshPromise = null;
    });

    return refreshPromise;
  }

  /**
   * 获取用户信息
   */
  async function getUserInfo(): Promise<UserInfo> {
    const data = await UserAPI.getInfo();
    if (!data) {
      throw new Error("Verification failed, please Login again.");
    }
    Object.assign(userInfo.value, data);
    return data;
  }

  /**
   * 登出
   */
  async function logout(): Promise<void> {
    await AuthAPI.logout();
    resetAllState();
  }

  /**
   * 重置所有系统状态
   *
   * 统一处理所有清理工作，包括用户凭证、路由、缓存等
   */
  function resetAllState(): void {
    // 1. 重置用户状态
    resetUserState();

    // 2. 重置其他模块状态
    usePermissionStoreHook().resetRouter();
    useDictStoreHook().clearDictCache();
    useTagsViewStore().delAllViews();

    // 3. 清理 SSE 连接
    cleanupSseServices();
  }

  /**
   * 重置用户状态
   *
   * 仅处理用户模块内的状态
   */
  function resetUserState(): void {
    AuthStorage.clearAuth();
    userInfo.value = {} as UserInfo;
  }

  /**
   * 刷新 token
   */
  async function doRefreshToken(): Promise<void> {
    const currentRefreshToken = AuthStorage.getRefreshToken();

    if (!currentRefreshToken) {
      throw new Error("没有有效的刷新令牌");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await AuthAPI.refreshToken(currentRefreshToken);
    AuthStorage.setTokens(accessToken, newRefreshToken, AuthStorage.getRememberMe());
  }

  return {
    userInfo,
    rememberMe,
    isLoggedIn: () => !!AuthStorage.getAccessToken(),
    login,
    logout,
    getUserInfo,
    resetAllState,
    resetUserState,
    refreshToken: doRefreshToken,
    refreshTokenOnce,
  };
});

/**
 * 在组件外部使用 UserStore 的钩子函数
 *
 * @see https://pinia.vuejs.org/core-concepts/outside-component-usage.html
 */
export function useUserStoreHook() {
  return useUserStore(store);
}
