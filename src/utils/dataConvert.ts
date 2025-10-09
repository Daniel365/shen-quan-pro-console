/**
 * @Author: v_jppjpeng
 * @Date: 2025-09-23 09:22:07
 * @Explain: 数据转换
 */
/**
 * 数组转成 以key为下标的对象
 * @param arr
 * @param fullObject
 * @returns
 *  1.转换为value为键，name为值的对象
    // 输出: { '': '全部等级', '1': '普通会员', '2': '半卡会员', '3': '年卡会员' }

    2.转换为value为键，整个对象为值的对象
    // 输出: {
    //   '': { name: '全部等级', value: '' },
    //   '1': { name: '普通会员', value: '1' },
    //   '2': { name: '半卡会员', value: '2' },
    //   '3': { name: '年卡会员', value: '3' }
    // }
 */
export function onArrToKeyObject<T extends {
  [key: string]: any
}>(
  arr: T[],
  config: { keyField?: keyof T, valueField?: keyof T } = {},
  fullObject = false,
): Record<string, T | T[keyof T]> {
  // 默认使用label和value作为键名和值名
  const { keyField = 'value' as keyof T, valueField = 'label' as keyof T } = config

  return arr.reduce((acc, item) => {
    // 将key转换为字符串类型，确保对象键的一致性
    const key = String(item[keyField])
    acc[key] = fullObject ? item : item[valueField]
    return acc
  }, {} as Record<string, T | T[keyof T]>)
}
