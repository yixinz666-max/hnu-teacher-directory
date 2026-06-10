# 🏛️ 湖南大学土木工程学院教师信息库

高校教师公开信息检索与展示平台，数据来源于湖南大学土木工程学院官网。

## 📁 项目结构

```
土木院网站/
├── index.html          # 首页（搜索、数据概览、系所分类、研究方向）
├── list.html           # 教师列表页（筛选 + 卡片列表）
├── detail.html         # 教师详情页（个人资料 + 详细信息）
├── about.html          # 数据说明页
├── css/
│   └── main.css        # 全局样式（响应式）
├── js/
│   └── main.js         # 全局脚本（数据加载、搜索、筛选、渲染）
├── data/
│   └── teachers.json   # 教师数据文件
├── crawl.py            # 数据爬取脚本
└── README.md           # 本文件
```

## 🚀 快速开始

### 方式一：直接打开（推荐）

1. 直接用浏览器打开 `index.html` 即可查看网站
2. 数据文件 `data/teachers.json` 需与页面在同一服务器（本地直接打开不受跨域限制）

### 方式二：本地服务器

```bash
# Python 3
python -m http.server 8080

# 或使用 Node.js
npx serve .

# 然后访问 http://localhost:8080
```

## 📊 数据采集

### 安装依赖

```bash
pip install requests beautifulsoup4
```

### 运行爬取脚本

```bash
python crawl.py
```

脚本会自动：
1. 访问教师名录主页，识别各系所链接
2. 遍历每个系所获取教师列表
3. 访问每位教师的详情页提取信息
4. 保存到 `data/teachers.json`

**注意：**
- 脚本设置了 1.5 秒请求间隔，避免对服务器造成压力
- 仅采集官网公开展示信息，不涉及隐私
- 不绕过登录、验证码或反爬限制

## 🎨 设计风格

- **主色**：深蓝色 `#0b2b4a` / `#123b61`
- **辅助色**：白色 `#ffffff`、浅灰 `#f5f6f8`
- **点缀色**：湖大红 `#8b1a2b`、金色 `#b8860b`
- **布局**：卡片式白底设计，轻微阴影与圆角
- **字体**：微软雅黑 / 思源黑体 / 系统无衬线

## 📱 响应式支持

- **桌面端**：完整导航栏、左侧筛选栏 + 右侧卡片列表、多列教师卡片
- **平板端**：收缩导航菜单、三列统计卡片、两列系所卡片
- **手机端**：汉堡菜单导航、筛选条件弹出抽屉、单列教师卡片、纵向详情

## 📝 教师信息字段

| 字段 | 说明 |
|------|------|
| name | 教师姓名 |
| department | 所属系所 |
| title | 职称 |
| position | 职务 |
| email | 办公邮箱 |
| office | 办公室 |
| education | 教育背景列表 |
| work_experience | 工作履历列表 |
| academic_roles | 学术兼职列表 |
| research_interests | 研究方向标签 |
| research_projects | 科研项目列表 |
| publications | 学术成果列表 |
| awards | 奖励荣誉列表 |
| enrollment | 招生信息 |
| intro | 个人简介 |
| source_url | 数据来源链接 |
| last_updated | 采集更新时间 |

## 🔧 技术栈

- 纯静态网站（HTML + CSS + JavaScript）
- 无需数据库或后端服务
- 数据驱动渲染（JSON → JS → HTML）
- 支持部署到 Nginx、GitHub Pages 等静态托管

## 🌐 GitHub Pages 部署

本项目可以直接部署到 GitHub Pages：

1. 将项目根目录下的所有文件和文件夹一起上传到 GitHub 仓库，包括 `index.html`、`css/`、`js/`、`data/`、`assets/` 和 `.nojekyll`。
2. 进入仓库 `Settings` → `Pages`。
3. `Build and deployment` 选择 `Deploy from a branch`。
4. `Branch` 选择 `main`，目录选择 `/root`，保存。
5. 部署完成后访问 `https://你的用户名.github.io/仓库名/`。

如果页面只显示纯 HTML、样式丢失或统计数字一直为 0，通常是 `css/`、`js/`、`data/`、`assets/` 没有一起上传，或 Pages 发布源没有选到仓库根目录。

## 📜 免责声明

本站仅为高校教师公开信息的检索与展示平台，所有信息以湖南大学土木工程学院官网发布为准。仅供学术交流与检索参考。
