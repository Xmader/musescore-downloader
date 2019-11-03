
export const getIndexPath = (id: number) => {
    const idStr = String(id)
    // 获取最后三位，倒序排列
    // "5449062" -> ["2", "6", "0"]
    const indexN = idStr.split("").reverse().slice(0, 3)
    return indexN.join("/")
}
