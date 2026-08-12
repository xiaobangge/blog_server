const db = require("../db/sql");
const filterByLevel = async function(tableName, params, callback) {
    const {page, pageSize, tj} = params
    await db.queryPage(tableName,page, pageSize, tj, async (result) => {
        const idList = result.data.list?.map(item => item.id)
        console.log(idList, 'idList')
        if (idList?.length) { 
            await filterByLevel(tableName, {
                page: 1,
                pageSize: 10000,
                tj: `WHERE target_id IN (${idList.join(",")})`
            }, (result1) => {
                console.log(result1, 'filterByLevel')
                result.data.list = result.data.list.concat(result1)
            })
        }
        callback(result)
    });
}

exports.filterByLevel = filterByLevel;