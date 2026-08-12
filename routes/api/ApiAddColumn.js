const db = require("../../db/sql");

exports.addColumnByTable = (req, res) => {
  const { table, cloumn, type = 'VARCHAR(255)', attributes } = req.body
  const alterTableQuery = `ALTER TABLE ${table} ADD COLUMN ${cloumn} ${type} ${attributes || ''}`;
  console.log(alterTableQuery, 'alterTableQuery')
  db.queryAction(alterTableQuery, `${table}表添加${cloumn}字段成功`, (result) => {
    res.status(200).json(result);
  });
};
