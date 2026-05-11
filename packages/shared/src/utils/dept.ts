import { DeptTreeVO } from "@/api/system/dept/types";

/** 过滤禁用的部门 */
export const filterDisabledDept = (deptList: DeptTreeVO[]) => {
  return deptList.filter((dept) => {
    if (dept.disabled) {
      return false;
    }
    if (dept.children && dept.children.length) {
      dept.children = filterDisabledDept(dept.children);
    } else if (!(dept.standDeptId && dept.standDeptId.startsWith("30."))) {
      return false;
    }
    return true;
  });
};

/** 查找部门 */
export const findDept = (deptId: string, deptList: DeptTreeVO[]): DeptTreeVO | null => {
  for (const dept of deptList) {
    if (dept.id == deptId) {
      return dept;
    }
    if (dept.children && dept.children.length) {
      const finded = findDept(deptId, dept.children);
      if (finded) {
        return finded;
      }
    }
  }
  return null;
};
