# VS Code 一键查看 Git 分支描述配置文档

> 目标：在 VS Code 中点击按钮，一键查看所有本地分支的备注（`branch.description`）。

## 一、原理说明

Git 原生支持为分支添加描述备注：

```bash
# 编辑当前分支的描述
git branch --edit-description

# 查询所有带备注的分支
git config --get-regexp "^branch\..*\.description$"
```

VS Code 的源代码管理面板原生不会显示分支描述，因此需要借助任务或插件按钮执行命令查看。

## 二、方案 A：侧边栏点击按钮（Command Dock 插件，推荐）

### 2.1 安装插件

在扩展商店搜索 `Command Dock`，安装发布者为 **CommandDock** 的扩展。

- 扩展标识：`CommandDock.command-dock`
- 扩展页面：<https://marketplace.visualstudio.com/items?itemName=CommandDock.command-dock>

> 注意：扩展商店中存在同名插件，请核对发布者或扩展标识，避免安装错误。

### 2.2 修改 VS Code 设置

1. 按 `Ctrl + ,` 打开设置。
2. 点击右上角的“打开设置（JSON）”按钮。
3. 在 `settings.json` 的最外层对象中添加以下配置：

```json
{
    "commandDock.buttons": [
        {
            "id": "git-branch-desc",
            "name": "📋 查看分支描述",
            "command": "git config --get-regexp \"^branch\\..*\\.description$\"",
            "icon": "git-branch",
            "color": "#4285F4"
        }
    ]
}
```

如果 `settings.json` 已经有其他配置，只添加 `"commandDock.buttons": [...]` 这一项，并注意前一项末尾需要有英文逗号。

保存设置后执行 `Developer: Reload Window`，或重启 VS Code。随后可在资源管理器侧栏的 **Command Dock** 面板中点击“📋 查看分支描述”，结果会显示在终端中。

> Windows 的 CMD 终端不要使用单引号包裹正则表达式。上面的双引号写法同时兼容 CMD、PowerShell 和常见的 Bash 终端。

## 三、方案 B：通过任务执行（无需插件）

在项目根目录创建 `.vscode` 文件夹，然后新建 `.vscode/tasks.json`：

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Git: 查看所有分支描述",
            "type": "shell",
            "command": "git config --get-regexp \"^branch\\..*\\.description$\"",
            "options": {
                "cwd": "${workspaceFolder}"
            },
            "presentation": {
                "reveal": "always",
                "panel": "new",
                "clear": true
            },
            "problemMatcher": []
        }
    ]
}
```

### 运行任务

按 `Ctrl + Shift + P`，输入并选择 `Tasks: Run Task`，再选择 `Git: 查看所有分支描述`。

### 可选：绑定快捷键

按 `Ctrl + Shift + P`，选择 `Preferences: Open Keyboard Shortcuts (JSON)`，在快捷键配置数组中添加：

```json
{
    "key": "ctrl+shift+b",
    "command": "workbench.action.tasks.runTask",
    "args": "Git: 查看所有分支描述"
}
```

> `Ctrl + Shift + B` 默认用于运行构建任务。如果项目已有构建任务，建议改成其他未占用快捷键，例如 `Ctrl + Alt + B`。

## 四、常用 Git 分支描述命令

```bash
# 编辑当前所在分支的描述
git branch --edit-description

# 手动设置指定分支描述  master是分支名
git config branch.master.description "旧主分支，已经不再使用"

# 查看指定分支描述
git config branch.dev.description

# 列出所有带描述的分支
git config --get-regexp "^branch\..*\.description$"

# 配置全局 Git 别名
git config --global alias.branch-desc "config --get-regexp ^branch\\..*\\.description$"

# 配置别名后，查看所有分支描述
git branch-desc
```

> `branch.description` 默认保存在当前仓库的 `.git/config` 中，不会随分支推送到远程仓库。上面的 `--global` 仅用于保存命令别名。

## 五、美化输出（Windows PowerShell）

在 PowerShell 终端中执行：

```powershell
git config --get-regexp '^branch\..*\.description$' | ForEach-Object {
    if ($_ -match '^branch\.(.*)\.description\s+(.*)$') {
        Write-Host ("{0,-20} {1}" -f $matches[1], $matches[2])
    }
}
```

输出示例：

```text
dev                  开发分支：后端接口迭代
feature-map          南充离线地图功能开发
release              生产发布分支
```

## 六、常见问题

### 1. JSON 配置报错

不要把 `tasks.json` 的完整内容放入 `settings.json` 的 `commandDock.buttons` 中。这是两个完全独立的配置文件：

- 插件按钮配置：VS Code 的 `settings.json`
- 项目任务配置：项目下的 `.vscode/tasks.json`

### 2. Windows CMD 执行正则时报错

CMD 不会像 Bash 一样处理单引号。请使用文档中的双引号写法，不要写成：

```text
git config --get-regexp 'branch\..*\.description'
```

### 3. VS Code 分支列表看不到备注

这是正常现象。分支描述属于 Git 配置项，不属于分支名称，VS Code 原生分支列表不会展示它。需要通过终端命令、任务或插件按钮查看。

### 4. 点击按钮后没有任何输出

可能原因：

- 当前打开的文件夹不是 Git 仓库；
- 当前仓库还没有任何分支设置描述；
- VS Code 终端所在目录不是目标仓库；
- 安装了同名但功能不同的 Command Dock 插件。

可以先在终端执行以下命令确认：

```bash
git rev-parse --is-inside-work-tree
git config --get-regexp "^branch\..*\.description$"
```

如果第二条命令没有输出，请先为当前分支设置描述：

```bash
git branch --edit-description
```

