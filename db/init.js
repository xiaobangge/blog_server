const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const requiredEnv = ["DB_HOST", "DB_USER", "DB_NAME"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length) {
  console.error(`Missing database configuration: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const image = (file) => `http://localhost:${process.env.PORT || 7777}/file/images/${file}`;
const avatar = (id) => `http://localhost:${process.env.PORT || 7777}/file/avatar/${id}.png`;

const tables = [
  `CREATE TABLE IF NOT EXISTS sys_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    avatar TEXT,
    email VARCHAR(100) UNIQUE,
    ip VARCHAR(100),
    address VARCHAR(100),
    system VARCHAR(100),
    state TINYINT DEFAULT 1,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS sys_article (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content LONGBLOB,
    image_url VARCHAR(255),
    type VARCHAR(100),
    heat INT DEFAULT 0,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS sys_article_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS sys_treehole (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS sys_comment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(255),
    avatar VARCHAR(255),
    nickname VARCHAR(100),
    url VARCHAR(255),
    uid INT,
    target_id INT,
    pid INT,
    email VARCHAR(100),
    type VARCHAR(100),
    content TEXT NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_comment_target (type, uid),
    INDEX idx_comment_parent (pid)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS sys_visitor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip VARCHAR(100) NOT NULL,
    address VARCHAR(100),
    longitude VARCHAR(100),
    latitude VARCHAR(100),
    system VARCHAR(100),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS sys_link (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    remark VARCHAR(255),
    type INT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS sys_project (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    remark VARCHAR(255),
    type INT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS sys_menu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_name VARCHAR(100) NOT NULL,
    menu_type INT,
    url VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    parent_id INT DEFAULT 0,
    open_type INT,
    sort INT,
    visible INT DEFAULT 1,
    remark VARCHAR(255),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS sys_find (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    type VARCHAR(100),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS sys_find_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS sys_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    articleId INT,
    avatarUrl VARCHAR(255),
    bhfAvatar VARCHAR(255),
    bhfName VARCHAR(100),
    matter VARCHAR(100),
    sourceName VARCHAR(100),
    type INT,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS sys_dynamics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    like_count INT DEFAULT 0,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS sys_visit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100), address VARCHAR(100), date VARCHAR(100), customer VARCHAR(100),
    type VARCHAR(100), keyman VARCHAR(100), position VARCHAR(100), phone VARCHAR(100),
    jmType VARCHAR(100), number VARCHAR(100), sort VARCHAR(100), decision VARCHAR(100),
    pirce VARCHAR(100), intention VARCHAR(100), activity VARCHAR(100), remark VARCHAR(100),
    create_by VARCHAR(100),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS sys_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uptime DATETIME,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
];

const seedIfEmpty = async (connection, table, columns, rows) => {
  const [[{ total }]] = await connection.query(`SELECT COUNT(*) AS total FROM ${table}`);
  if (total > 0 || rows.length === 0) return 0;

  const placeholders = rows.map(() => `(${columns.map(() => "?").join(", ")})`).join(", ");
  const values = rows.flat();
  await connection.query(
    `INSERT INTO ${table} (${columns.join(", ")}) VALUES ${placeholders}`,
    values
  );
  return rows.length;
};

async function init() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS || "",
    multipleStatements: true
  });

  try {
    const database = mysql.escapeId(process.env.DB_NAME);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.changeUser({ database: process.env.DB_NAME });

    for (const sql of tables) await connection.query(sql);
    console.log(`Database and ${tables.length} tables are ready.`);

    const password = bcrypt.hashSync("admin123", 10);
    const seeded = {};

    seeded.sys_user = await seedIfEmpty(connection, "sys_user",
      ["username", "password", "avatar", "email", "ip", "address", "system", "state", "create_at"], [
        ["Sean", password, avatar(1), "sean@example.com", "127.0.0.1", "中国 · 上海", "macOS / Chrome", 1, "2025-04-18 09:00:00"],
        ["admin", password, avatar(2), "admin@example.com", "127.0.0.1", "中国 · 上海", "macOS / Chrome", 1, "2025-04-18 09:05:00"],
        ["reader", password, avatar(8), "reader@example.com", "127.0.0.1", "中国 · 杭州", "Windows / Edge", 1, "2025-05-20 15:30:00"]
      ]);

    seeded.sys_article_type = await seedIfEmpty(connection, "sys_article_type", ["id", "name", "create_at"], [
      [1, "前端开发", "2024-11-02 10:00:00"],
      [2, "后端实践", "2024-11-02 10:01:00"],
      [3, "生活随笔", "2024-11-02 10:02:00"],
      [4, "效率工具", "2024-11-02 10:03:00"]
    ]);

    const articles = [
      ["用 Vue 3 搭建一个有温度的个人博客", `# 用 Vue 3 搭建一个有温度的个人博客\n\n这个博客使用 **Vue 3、Vite 与 Element Plus** 构建。相比功能堆砌，我更在意阅读节奏、内容层级，以及每次打开页面时那一点熟悉感。\n\n## 页面结构\n\n- 首页呈现最近的文章与动态\n- 归档按年份串联写作轨迹\n- 发现页收集值得反复使用的网站\n- 留言与树洞让交流不只停留在文章下面\n\n## 开发心得\n\n组件拆分的标准不是越小越好，而是让数据边界和交互意图足够清楚。样式也应服务内容，让读者先看到文章，再感受到设计。`, image("file-1748054950885.jpg"), "1", 286, "2026-07-28 20:18:00"],
      ["Express 与 MySQL：从接口到可恢复的数据层", `# Express 与 MySQL\n\n个人项目同样需要可靠的数据恢复方案。数据库表结构、初始化数据和环境配置应当进入项目维护流程，而不是只存在于某台电脑。\n\n## 这次整理的重点\n\n1. 使用顺序执行的脚本创建数据库和表。\n2. 初始化操作可重复执行，不覆盖已有内容。\n3. 为文章、评论和动态建立一致的关联字段。\n4. 准备一套本地演示数据，让新环境启动后即可检查全部页面。\n\n一条命令能够重建开发环境，是维护体验的重要组成部分。`, image("file-1748056439668.jpg"), "2", 198, "2026-07-10 10:30:00"],
      ["我的 2026 桌面与开发工作流", `# 我的开发工作流\n\n稳定的工作流不一定复杂：一个清晰的任务列表、一套熟悉的终端命令，以及能快速进入状态的编辑器配置就足够了。\n\n## 每日习惯\n\n- 上午处理需要连续思考的工作\n- 下午完成沟通、评审与小任务\n- 每周整理一次笔记和收藏\n- 对重复三次以上的操作进行自动化\n\n工具的价值，在于把注意力还给真正重要的问题。`, image("file-1748075533508.jpg"), "4", 156, "2026-06-21 08:45:00"],
      ["周末去看海：把时间留给缓慢发生的事", `# 周末去看海\n\n傍晚的海边没有明确的待办事项。风从远处吹来，人群沿着岸线慢慢散开。\n\n我带了一本没有读完的书，却只是坐着看天色变化。生活需要一些没有产出的时刻，它们让忙碌重新有了尺度。\n\n> 记录并不是为了留住一切，而是提醒自己曾经认真感受过。`, image("file-1748236936738.jpg"), "3", 132, "2026-05-18 18:20:00"],
      ["前端性能优化清单：从感知速度开始", `# 前端性能优化清单\n\n性能优化首先是用户体验问题，然后才是指标问题。\n\n## 可以立刻检查的项目\n\n- 图片使用合适尺寸并开启懒加载\n- 路由与大型组件按需加载\n- 避免首页发出重复请求\n- 为加载、空数据和失败状态提供明确反馈\n- 控制第三方脚本的体积与执行时机\n\n优化前先测量，优化后再验证，才能知道改动是否真的有效。`, image("file-1748402574531.jpg"), "1", 241, "2026-04-26 14:12:00"],
      ["写给独立开发者的数据库备份备忘录", `# 数据库备份备忘录\n\n数据只有在完成恢复演练后，才算真正拥有备份。\n\n建议至少保留：每日自动备份、异地副本、版本化表结构，以及一份不包含真实隐私信息的开发种子数据。恢复脚本需要定期执行，避免在真正需要时才发现不可用。`, image("file-1748501977552.jpg"), "2", 175, "2025-12-30 22:05:00"]
    ];
    seeded.sys_article = await seedIfEmpty(connection, "sys_article",
      ["title", "content", "image_url", "type", "heat", "create_at"], articles);

    seeded.sys_dynamics = await seedIfEmpty(connection, "sys_dynamics", ["content", "like_count", "create_at"], [
      ["博客的本地开发环境重新整理好了。把建库、建表和演示数据都放进初始化流程后，心里踏实了不少。", 18, "2026-08-10 21:16:00"],
      ["读完一本关于设计系统的书。好的规范不是限制表达，而是减少那些没有价值的重复决定。", 12, "2026-08-02 19:40:00"],
      [`周末沿江走了很久，随手拍下晚霞。<img src="${image("file-1748425278654.jpg")}" style="max-width: 320px; border-radius: 6px; margin-top: 12px;" />`, 25, "2026-07-20 18:52:00"],
      ["最近在整理旧文章，很多当时觉得理所当然的结论，现在回头看都有了新的答案。", 9, "2026-06-12 09:25:00"]
    ]);

    seeded.sys_comment = await seedIfEmpty(connection, "sys_comment",
      ["avatar", "nickname", "url", "uid", "target_id", "pid", "email", "type", "content", "create_at"], [
        [avatar(7), "北岛", "https://github.com/", 1, null, null, "beidao@example.com", "article", "页面的阅读体验很舒服，尤其喜欢归档和发现页的组织方式。", "2026-07-29 11:12:00"],
        [avatar(1), "Sean", "", 1, 1, 1, "sean@example.com", "article", "谢谢，也欢迎常来看看，后面会继续补充开发记录。", "2026-07-29 13:25:00"],
        [avatar(9), "小满", "", 2, null, null, "xiaoman@example.com", "article", "初始化脚本可重复执行这个细节很实用，开发环境确实应该随时可重建。", "2026-07-11 08:34:00"],
        [avatar(12), "远山", "", 1, null, null, "yuanshan@example.com", "comment", "数据恢复完成，之后记得把备份也纳入日常维护。", "2026-08-10 22:03:00"],
        [avatar(1), "Sean", "", 1, 4, 4, "sean@example.com", "comment", "已经安排了定期备份和恢复检查。", "2026-08-10 22:18:00"],
        [avatar(5), "清风", "https://example.com", null, null, null, "qingfeng@example.com", "message", "偶然路过，很喜欢这里安静又丰富的感觉，留下一个脚印。", "2026-08-05 16:10:00"],
        [avatar(15), "木棉", "", null, null, null, "mumi@example.com", "link", "友链信息已提交，祝博客越写越好。", "2026-07-08 10:28:00"]
      ]);

    seeded.sys_treehole = await seedIfEmpty(connection, "sys_treehole", ["content", "create_at"], [
      ["愿每一次认真记录，都能在未来的某一天回应自己。", "2026-08-11 09:20:00"],
      ["今天也要记得抬头看看云。", "2026-08-08 17:42:00"],
      ["刚完成了一个拖延很久的小目标，原来开始之后并没有想象中困难。", "2026-08-01 23:08:00"],
      ["希望今年能读完二十本书，也去几个从未到过的地方。", "2026-07-22 12:36:00"],
      ["写代码累了就去散步，答案常常在离开屏幕后出现。", "2026-07-15 20:14:00"]
    ]);

    seeded.sys_link = await seedIfEmpty(connection, "sys_link", ["name", "url", "avatar", "remark", "type", "create_at"], [
      ["Vue.js", "https://vuejs.org/", "https://vuejs.org/logo.svg", "渐进式 JavaScript 框架", 1, "2026-01-05 10:00:00"],
      ["Node.js", "https://nodejs.org/", "https://nodejs.org/static/images/logo.svg", "高效的 JavaScript 运行时", 1, "2026-01-05 10:02:00"],
      ["MDN Web Docs", "https://developer.mozilla.org/zh-CN/", "https://developer.mozilla.org/favicon-48x48.cbbd161b.png", "可靠的 Web 开发参考资料", 1, "2026-01-05 10:04:00"],
      ["GitHub", "https://github.com/", "https://github.githubassets.com/favicons/favicon.svg", "代码、协作与开源社区", 2, "2026-01-05 10:06:00"]
    ]);

    seeded.sys_project = await seedIfEmpty(connection, "sys_project", ["name", "url", "avatar", "remark", "type", "create_at"], [
      ["Sean Blog", "http://localhost:3000/", image("file-1745730370166.png"), "Vue 3 + Express 构建的个人博客与内容管理系统", 1, "2026-04-18 12:00:00"],
      ["开发者工具箱", "https://github.com/", image("file-1745990615905.png"), "收集日常开发中常用的脚本、片段与检查清单", 1, "2026-03-12 14:30:00"],
      ["阅读清单", "http://localhost:3000/#/Find", image("file-1745731188385.png"), "将文章、设计灵感和学习资料整理成可检索的收藏", 1, "2026-02-20 09:45:00"]
    ]);

    seeded.sys_find_type = await seedIfEmpty(connection, "sys_find_type", ["id", "title", "image_url", "create_at"], [
      [1, "开发文档", "https://cdn.simpleicons.org/readthedocs/3B82F6", "2026-01-10 09:00:00"],
      [2, "设计灵感", "https://cdn.simpleicons.org/dribbble/EA4C89", "2026-01-10 09:01:00"],
      [3, "效率工具", "https://cdn.simpleicons.org/raycast/FF6363", "2026-01-10 09:02:00"]
    ]);

    seeded.sys_find = await seedIfEmpty(connection, "sys_find", ["title", "url", "content", "image_url", "type", "create_at"], [
      ["Vue 3 文档", "https://cn.vuejs.org/", "Vue 3 官方中文文档与 API 参考", "https://vuejs.org/logo.svg", "1", "2026-02-01 10:00:00"],
      ["Node.js 文档", "https://nodejs.org/docs/latest/api/", "Node.js 核心模块与运行时 API", "https://nodejs.org/static/images/favicons/favicon.png", "1", "2026-02-01 10:05:00"],
      ["MDN", "https://developer.mozilla.org/zh-CN/", "覆盖 HTML、CSS 与 JavaScript 的 Web 开发文档", "https://developer.mozilla.org/favicon-48x48.cbbd161b.png", "1", "2026-02-01 10:10:00"],
      ["Awwwards", "https://www.awwwards.com/", "网页设计案例与交互灵感", "https://www.awwwards.com/favicon.ico", "2", "2026-02-03 11:00:00"],
      ["Dribbble", "https://dribbble.com/", "产品界面、插画与视觉设计作品", "https://cdn.simpleicons.org/dribbble/EA4C89", "2", "2026-02-03 11:05:00"],
      ["Can I use", "https://caniuse.com/", "快速查询浏览器特性兼容性", "https://caniuse.com/img/favicon-128.png", "3", "2026-02-05 16:00:00"],
      ["TinyPNG", "https://tinypng.com/", "压缩图片体积并保持良好观感", "https://tinypng.com/images/apple-touch-icon.png", "3", "2026-02-05 16:05:00"]
    ]);

    const menuRows = [
      [1, "内容管理", 1, "/document", "ri:file-list-3-line", 0, 1, 1, 1, "文章与互动内容", "2026-01-01 09:00:00"],
      [2, "文章管理", 2, "/document/article/index.vue", "ri:article-line", 1, 1, 1, 1, "", "2026-01-01 09:01:00"],
      [3, "评论管理", 2, "/document/comment/index.vue", "ri:chat-3-line", 1, 1, 2, 1, "", "2026-01-01 09:02:00"],
      [4, "留言管理", 2, "/document/message/index.vue", "ri:message-2-line", 1, 1, 3, 1, "", "2026-01-01 09:03:00"],
      [5, "发现管理", 1, "/find", "ri:compass-3-line", 0, 1, 2, 1, "发现内容与分类", "2026-01-01 09:04:00"],
      [6, "发现列表", 2, "/find/index.vue", "ri:links-line", 5, 1, 1, 1, "", "2026-01-01 09:05:00"],
      [7, "发现分类", 2, "/find/type.vue", "ri:price-tag-3-line", 5, 1, 2, 1, "", "2026-01-01 09:06:00"],
      [8, "友链管理", 2, "/links/index.vue", "ri:link", 0, 1, 3, 1, "", "2026-01-01 09:07:00"],
      [9, "项目管理", 2, "/project/index.vue", "ri:code-box-line", 0, 1, 4, 1, "", "2026-01-01 09:08:00"],
      [10, "系统管理", 1, "/system", "ri:settings-3-line", 0, 1, 5, 1, "用户与菜单", "2026-01-01 09:09:00"],
      [11, "用户管理", 2, "/system/user/index.vue", "ri:user-settings-line", 10, 1, 1, 1, "", "2026-01-01 09:10:00"],
      [12, "菜单管理", 2, "/system/menu/index.vue", "ri:menu-2-line", 10, 1, 2, 1, "", "2026-01-01 09:11:00"],
      [13, "影音收藏", 2, "/Audiovisual/music/index.vue", "ri:music-2-line", 0, 1, 6, 1, "", "2026-01-01 09:12:00"]
    ];
    seeded.sys_menu = await seedIfEmpty(connection, "sys_menu",
      ["id", "menu_name", "menu_type", "url", "icon", "parent_id", "open_type", "sort", "visible", "remark", "create_at"], menuRows);

    seeded.sys_visitor = await seedIfEmpty(connection, "sys_visitor",
      ["ip", "address", "longitude", "latitude", "system", "create_at"], [
        ["127.0.0.1", "上海", "121.4737", "31.2304", "macOS / Chrome", "2026-08-12 09:15:00"],
        ["192.0.2.10", "杭州", "120.1551", "30.2741", "Windows / Edge", "2026-08-11 13:42:00"],
        ["192.0.2.11", "北京", "116.4074", "39.9042", "iOS / Safari", "2026-08-10 20:18:00"],
        ["192.0.2.12", "深圳", "114.0579", "22.5431", "Android / Chrome", "2026-08-08 08:06:00"],
        ["192.0.2.13", "成都", "104.0665", "30.5723", "macOS / Safari", "2026-08-03 17:35:00"],
        ["192.0.2.14", "广州", "113.2644", "23.1291", "Windows / Chrome", "2026-07-28 12:20:00"],
        ["192.0.2.15", "南京", "118.7969", "32.0603", "Linux / Firefox", "2026-07-16 19:48:00"],
        ["192.0.2.16", "武汉", "114.3054", "30.5931", "Android / Chrome", "2026-06-30 10:11:00"]
      ]);

    seeded.sys_log = await seedIfEmpty(connection, "sys_log",
      ["name", "articleId", "avatarUrl", "matter", "sourceName", "type", "time", "create_at"], [
        ["北岛", 1, avatar(7), "评论了文章", "用 Vue 3 搭建一个有温度的个人博客", 2, "2026-07-29 11:12:00", "2026-07-29 11:12:00"],
        ["小满", 2, avatar(9), "评论了文章", "Express 与 MySQL：从接口到可恢复的数据层", 2, "2026-07-11 08:34:00", "2026-07-11 08:34:00"],
        ["清风", null, avatar(5), "留下了新留言", "偶然路过，很喜欢这里", 3, "2026-08-05 16:10:00", "2026-08-05 16:10:00"],
        [null, 1, null, "有人阅读了", "用 Vue 3 搭建一个有温度的个人博客", 5, "2026-08-12 09:20:00", "2026-08-12 09:20:00"],
        [null, null, null, "有人来访", "上海", 9, "2026-08-12 09:15:00", "2026-08-12 09:15:00"]
      ]);

    const inserted = Object.values(seeded).reduce((sum, count) => sum + count, 0);
    console.log(`Seed data is ready (${inserted} new rows).`);
    console.table(seeded);
  } finally {
    await connection.end();
  }
}

init().catch((error) => {
  console.error("Database initialization failed:", error.message);
  process.exit(1);
});
