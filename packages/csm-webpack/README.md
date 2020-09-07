## @tone./csm-webpack

webpack 插件

```js
plugins: [
  new CSMServiceWebpackPlugin({
    // csm-ui 执行路径
    exec: path.join(process.cwd(), '../../', 'node_modules', '@tone./csm-ui'),
    // csm-ui 端口
    port: 3000,
    // csm-ui 自定义存储库
    store: ''
  })
]
```
