import request from "@/utils/request";
import type { DeptQueryParams, DeptItem, DeptForm } from "./types";
import type { OptionItem } from "@/api/common";

const DEPT_BASE_URL = "/api/v1/depts";

const DeptAPI = {
  /** 获取部门树形列表 */
  getList(queryParams?: DeptQueryParams) {
    return request<unknown, DeptItem[]>({
      url: `${DEPT_BASE_URL}`,
      method: "get",
      params: queryParams,
    });
  },
  /** 获取部门下拉数据源 */
  getOptions() {
    return Promise.resolve<OptionItem[]>([
      {
        value: "1",
        label: "荣世科技",
        children: [
          {
            value: "2",
            label: "研发部门",
          },
          {
            value: "3",
            label: "测试部门",
          },
        ],
      },
    ]);
    // return request<unknown, OptionItem[]>({ url: `${DEPT_BASE_URL}/options`, method: "get" });
  },
  /** 获取部门表单数据 */
  getFormData(id: string) {
    return request<unknown, DeptForm>({ url: `${DEPT_BASE_URL}/${id}/form`, method: "get" });
  },
  /** 新增部门 */
  create(data: DeptForm) {
    return request({ url: `${DEPT_BASE_URL}`, method: "post", data });
  },
  /** 修改部门 */
  update(id: string, data: DeptForm) {
    return request({ url: `${DEPT_BASE_URL}/${id}`, method: "put", data });
  },
  /** 批量删除部门，多个以英文逗号(,)分割 */
  deleteByIds(ids: string) {
    return request({ url: `${DEPT_BASE_URL}/${ids}`, method: "delete" });
  },
};

export default DeptAPI;

// 重导出类型
export * from "./types";
