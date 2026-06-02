import request from "@/utils/request";
import type { MenuQueryParams, MenuItem, MenuForm, RouteItem } from "./types";
import type { OptionItem } from "@/api/common";

const MENU_BASE_URL = "/api/v1/menus";

const MenuAPI = {
  /** 获取当前用户的路由列表 */
  getRoutes() {
    if (window.localStorage.getItem("currentUser") === "admin") {
      return [
        {
          path: "/indicatorList",
          component: "Layout",
          redirect: "/indicatorList/index",
          name: "/indicatorList",

          children: [
            {
              path: "index",
              name: "IndicatorList",
              component: "indicatorList/index",
              meta: {
                title: "指标中心",
                icon: "document",
                hidden: false,
                alwaysShow: false,
                params: null,
              },
            },
          ],
        },

        {
          path: "/aiScorePage",
          component: "Layout",
          redirect: "/aiScorePage/index",
          name: "/aiScorePage",

          children: [
            {
              path: "index",
              name: "AiScorePage",
              component: "aiScorePage/index",
              meta: {
                title: "AI评分报告",
                icon: "dict",
                hidden: false,
                alwaysShow: false,
                params: null,
              },
            },
          ],
        },

        {
          path: "/system",
          component: "Layout",
          redirect: "/system/user",
          name: "/system",
          meta: {
            title: "系统管理",
            icon: "system",
            hidden: false,
            alwaysShow: false,
            params: null,
          },
          children: [
            // {
            //   path: "user",
            //   component: "system/user/index",
            //   name: "User",
            //   meta: {
            //     title: "用户管理",
            //     icon: "el-icon-User",
            //     hidden: false,
            //     keepAlive: true,
            //     alwaysShow: false,
            //     params: null,
            //   },
            // },
            // {
            //   path: "role",
            //   component: "system/role/index",
            //   name: "Role",
            //   meta: {
            //     title: "角色管理",
            //     icon: "role",
            //     hidden: false,
            //     keepAlive: true,
            //     alwaysShow: false,
            //     params: null,
            //   },
            // },
            {
              path: "department",
              component: "system/department/index",
              name: "Department",
              meta: {
                title: "部门管理",
                icon: "tree",
                hidden: false,
                keepAlive: true,
                alwaysShow: false,
                params: null,
              },
            },
          ],
        },
      ];
    }
    return [
      {
        path: "/indicatorList",
        component: "Layout",
        redirect: "/indicatorList/index",
        name: "/indicatorList",

        children: [
          {
            path: "index",
            name: "IndicatorList",
            component: "indicatorList/index",
            meta: {
              title: "指标中心",
              icon: "document",
              hidden: false,
              alwaysShow: false,
              params: null,
            },
          },
          {
            path: "dept-detail",
            name: "DeptDetail",
            component: "indicatorList/DeptDetail",
            meta: {
              title: "填报详情",
              hidden: true,
              alwaysShow: true,
              params: null,
            },
          },
        ],
      },
    ];
  },
  /** 获取菜单树形列表 */
  getList(queryParams: MenuQueryParams) {
    return request<unknown, MenuItem[]>({
      url: `${MENU_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },
  /** 获取菜单下拉数据源 */
  getOptions(onlyParent?: boolean, scope?: number) {
    return request<unknown, OptionItem[]>({
      url: `${MENU_BASE_URL}/options`,
      method: "get",
      params: { onlyParent, scope },
    });
  },
  /** 获取菜单表单数据 */
  getFormData(id: string) {
    return request<unknown, MenuForm>({ url: `${MENU_BASE_URL}/${id}/form`, method: "get" });
  },
  /** 新增菜单 */
  create(data: MenuForm) {
    return request({ url: `${MENU_BASE_URL}`, method: "post", data });
  },
  /** 修改菜单 */
  update(id: string, data: MenuForm) {
    return request({ url: `${MENU_BASE_URL}/${id}`, method: "put", data });
  },
  /** 删除菜单 */
  deleteById(id: string) {
    return request({ url: `${MENU_BASE_URL}/${id}`, method: "delete" });
  },
};

export default MenuAPI;

// 重导出类型
export * from "./types";
