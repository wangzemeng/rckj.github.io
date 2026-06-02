import request from "@/utils/request";
import type { RoleQueryParams, RoleItem, RoleForm } from "./types";
import type { OptionItem } from "@/api/common";

const ROLE_BASE_URL = "/api/v1/roles";

const RoleAPI = {
  /** 获取角色分页数据 */
  getPage(queryParams?: RoleQueryParams) {
    return Promise.resolve<PageResult<RoleItem>>({
      list: [
        {
          id: "2",
          name: "系统管理员",
          code: "ADMIN",
          status: 1,
          sort: 2,
          dataScope: 1,
          createTime: "2021-03-25 12:39:54",
          updateTime: null,
        },
        {
          id: "3",
          name: "访问游客",
          code: "GUEST",
          status: 1,
          sort: 3,
          dataScope: 3,
          createTime: "2021-05-26 15:49:05",
          updateTime: "2019-05-05 16:00:00",
        },
        {
          id: "4",
          name: "部门主管",
          code: "DEPT_MANAGER",
          status: 1,
          sort: 4,
          dataScope: 2,
          createTime: "2021-03-25 12:39:54",
          updateTime: null,
        },
        {
          id: "5",
          name: "部门成员",
          code: "DEPT_MEMBER",
          status: 1,
          sort: 5,
          dataScope: 3,
          createTime: "2021-03-25 12:39:54",
          updateTime: null,
        },
        {
          id: "6",
          name: "普通员工",
          code: "EMPLOYEE",
          status: 1,
          sort: 6,
          dataScope: 4,
          createTime: "2021-03-25 12:39:54",
          updateTime: null,
        },
        {
          id: "7",
          name: "自定义权限用户",
          code: "CUSTOM_USER",
          status: 1,
          sort: 7,
          dataScope: 5,
          createTime: "2021-03-25 12:39:54",
          updateTime: null,
        },
      ],
      total: 6,
    });
    // return request<unknown, PageResult<RoleItem>>({
    //   url: `${ROLE_BASE_URL}`,
    //   method: "get",
    //   params: queryParams,
    // });
  },
  /** 获取角色下拉数据源 */
  getOptions() {
    return request<unknown, OptionItem[]>({ url: `${ROLE_BASE_URL}/options`, method: "get" });
  },
  /** 获取角色的菜单ID集合 */
  getRoleMenuIds(roleId: string) {
    return request<unknown, string[]>({
      url: `${ROLE_BASE_URL}/${roleId}/menu-ids`,
      method: "get",
    });
  },
  /** 分配菜单权限 */
  updateRoleMenus(roleId: string, data: number[]) {
    return request({ url: `${ROLE_BASE_URL}/${roleId}/menus`, method: "put", data });
  },
  /** 获取角色表单数据 */
  getFormData(id: string) {
    return request<unknown, RoleForm>({ url: `${ROLE_BASE_URL}/${id}/form`, method: "get" });
  },
  /** 获取角色的部门ID集合(自定义数据权限) */
  getRoleDeptIds(roleId: string) {
    return request<unknown, string[]>({
      url: `${ROLE_BASE_URL}/${roleId}/dept-ids`,
      method: "get",
    });
  },
  /** 新增角色 */
  create(data: RoleForm) {
    return request({ url: `${ROLE_BASE_URL}`, method: "post", data });
  },
  /** 更新角色 */
  update(id: string, data: RoleForm) {
    return request({ url: `${ROLE_BASE_URL}/${id}`, method: "put", data });
  },
  /** 批量删除角色，多个以英文逗号(,)分割 */
  deleteByIds(ids: string) {
    return request({ url: `${ROLE_BASE_URL}/${ids}`, method: "delete" });
  },
};

export default RoleAPI;

// 重导出类型
export * from "./types";
