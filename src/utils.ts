
export const getIndexPath = (id: number) => {
    const idStr = String(id)
    // 获取最后三位，倒序排列
    // x, y, z are the reversed last digits of the score id. Example: id 123456789, x = 9, y = 8, z = 7
    // https://developers.musescore.com/#/file-urls
    // "5449062" -> ["2", "6", "0"]
    const indexN = idStr.split("").reverse().slice(0, 3)
    return indexN.join("/")
}
