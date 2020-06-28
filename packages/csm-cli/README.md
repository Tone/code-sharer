## @tone/csm-cli

安装

```bash
# yarn
yarn global add @tone/csm-cli

# npm
npm i @tone/csm-cli -g
```

提供命令:

```sh
Commands:
  csm init [storageDir]     Init local storage
  csm pick <name> [target]  Pick materials to project
  csm patch <name> [dir]    Patch material
  csm publish [name]        Publish material to repository
  csm search <name>         Search material
  csm submit [dir]          Submit material to storage
  csm update [name]         Update repository

Options:
  --version  Show version number  [boolean]
  --help     Show help  [boolean]
```

### `csm init [storageDir]`

初始化存储库，首次运行执行。

- `storageDir` 存储库位置 可选参数

  存储库默认位置为`$HOME/.cms-center`,初次执行后存储库位置确具体配置文件位置为`$HOME/.csm.conf`，JSON 格式

### `csm submit [dir]`

交互式提交一个物料到存储库

- `dir` 物料文件位置 可选参数

  默认取`当前执行路径`；若提供取`当前执行路径`拼接`dir`字段；

### `csm pick <name> [target] -r repositoryName -c categoryName`

载入指定物料文件到工程，可通过交互式或参数指定物料具体的仓库和类别

- `name` 物料名称 必选参数
- `target` 载入文件的位置 可选参数

  物料载入工程的路径，默认取`当前执行路径`拼接所属仓库所属类别的 `position`字段; 若提供相对路径，取`当前执行路径`拼接`target`字段；提供绝对路径，取`target`字段。

- `--repository`, `-r` 所属仓库 可选参数
- `--category`, `-c` 所属类别 可选参数

### `csm patch <name> [dir] -r repositoryName -c categoryName`

更新指定位置文件到物料，可通过交互式或参数指定物料具体的仓库和类别

- `name` 物料名称 必选参数
- `dir` 更新文件的位置 可选参数

  更新文件的位置，默认取`当前执行路径`；若提供取`当前执行路径`拼接`dir`字段；

- `--repository`, `-r` 所属仓库 可选参数
- `--category`, `-c` 所属类别 可选参数

### `csm search <name> -r repositoryName -c categoryName`

查找物料，输出符合的物料列表展示所属仓库及类别

- `name` 物料名称 必选参数

  默认查找所有仓库下物料名称包括参数的物料

- `--repository`, `-r` 所属仓库 可选参数

  查找指定仓库下物料名称包括参数的物料

- `--category`, `-c` 所属类别 可选参数

  查找指定仓库指定类别下物料名称包括参数的物料

### `csm update [name]`

更新所有仓库或指定仓库

- `name` 仓库名称 可选参数

  默认从远端更新所有仓库；若提供从远端更新指定仓库

### `csm publish <name> -r repositoryName -c categoryName`

推送指定物料或存储库变更到远端存储库，可通过交互式或参数指定物料具体的仓库和类别

- `name` 物料名称 可选参数

  不提供参数推送存储库变更到远端；提供参数推送指定物料到远端

- `--repository`, `-r` 所属仓库 可选参数
- `--category`, `-c` 所属类别 可选参数
