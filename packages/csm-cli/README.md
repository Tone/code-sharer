## @tone./csm-cli

安装

```bash
# yarn
yarn global add @tone./csm-cli

# npm
npm i @tone./csm-cli -g
```

提供命令:

```sh
Commands:
  csm init                           Init material storage
  csm config <handle> [key] [value]  config storage
  csm create                         create material
  csm download                       Download material
  csm publish                        Publish material to repository
  csm search                         Search material

Options:
  --version  Show version number  [boolean]
  --help     Show help  [boolean]
```

### `csm init`

初始化存储库，首次运行执行。

### `csm create`

交互式创建一个物料到存储库

### `csm download`

载入指定物料文件到工程，可通过交互式或参数指定物料具体的仓库和类别

### `csm search`

查找物料，输出符合的物料列表展示所属仓库及类别

### `csm publish`

推送指定物料或存储库变更到远端存储库，可通过交互式或参数指定物料具体的仓库和类别
