import { Compiler } from 'webpack'
import { spawn } from 'child_process'
import path from 'path'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const HtmlWebpackPlugin = require('safe-require')('html-webpack-plugin')

// const HtmlWebpackPlugin = require('safe-require')(webpack-html3')

const execPath = require.resolve('@tone./csm-ui')

interface Options {
  port?: number,
  exec?: string,
  store?: string
}

function injectIframe(html: string, port: string) {
  const strArr = html.split(/(<\/body>)/)

  const iframe = `<div id="csm_service__btn">
  <svg class="csm_service__btn__close" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    class="feather feather-x">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
  <svg class="csm_service__btn__open" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    class="feather feather-box">
    <path
      d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z">
    </path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
  <style>
    #csm_service__btn {
      position: fixed;
      bottom: 5%;
      right: 5%;
      z-index: 9999;
      padding: 10px;
      background: rgba(0, 0, 0, 0.09);
      border-radius: 50%;
      cursor: pointer;
    }
    #csm_service__btn svg {
      display:block;
    }
    #csm_service__btn iframe,
    #csm_service__btn .csm_service__btn__close {
      display: none;
    }

    #csm_service__btn.show .csm_service__btn__open {
      display: none;
    }

    #csm_service__btn.show .csm_service__btn__close {
      display: block;
    }

    #csm_service__btn.show iframe {

      display: block;
      position: fixed;
      top: 5%;
      width: 70%;
      max-width: 1280px;
      margin: auto;
      margin: auto;
      left: 0;
      right: 0;
      height: 80%;
      box-shadow: 0 5px 12px 4px rgba(0, 0, 0, 0.09);
    }
  </style>
  <iframe src="//localhost:${port}" frameborder="0"></iframe>
  <script>
    var open = document.getElementsByClassName('csm_service__btn__open')[0]
    var close = document.getElementsByClassName('csm_service__btn__close')[0]
    open.addEventListener('click', function (e) {
      this.parentElement.setAttribute('class', 'show')
    })
    close.addEventListener('click', function () {
      this.parentElement.setAttribute('class', '')
    })
  </script>
</div>
`

  strArr.splice(1, 0, iframe)

  return strArr.join('')
}

export class CSMServiceWebpackPlugin {
  port: string
  exec: string
  store?: string
  constructor(options: Options = { port: 3020, exec: execPath, store: '' }) {
    this.port = options.port !== undefined ? `${options.port}` : '3020'
    this.exec = options.exec ?? execPath
    this.store = options.store
  }

  apply(compiler: Compiler) {
    if (compiler.options.mode === 'development') {
      // start server
      compiler.hooks.afterEnvironment.tap(
        this.constructor.name,
        () => {
          if (compiler.options.mode === 'development') {
            const service = spawn('node', [this.exec], {
              cwd: path.dirname(this.exec),
              env: { ...process.env, STORE_URL: this.store, PORT: this.port, NODE_ENV: 'production', PROJECT: process.cwd() }
            })
            service.stdout.on('data', data => console.log('[CSM_SERVICE]:', data.toString()))
            service.stderr.on('data', data => console.log('[CSM_SERVICE]:', data.toString()))
            service.on('close', (code) => console.log('[CSM_SERVICE]Close:', code))
          }
        }
      )
      // auto inject html
      compiler.hooks.compilation.tap(this.constructor.name, (compilation) => {
        if (HtmlWebpackPlugin?.getHooks !== undefined) {
          HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
            this.constructor.name,
            (htmlPluginData: any, cb: Function) => {
              // Manipulate the content
              htmlPluginData.html = injectIframe(htmlPluginData.html, this.port)
              // Tell webpack to move on
              cb(null, htmlPluginData)
            }
          )
        } else if (HtmlWebpackPlugin === undefined) {
          console.log('Not found HtmlWebpackPlugin, Please handle it manually')
        } else if (HtmlWebpackPlugin.getHooks === undefined) {
          const compilationHooks = compilation.hooks as any
          compilationHooks.htmlWebpackPluginBeforeHtmlProcessing.tap(
            this.constructor.name,
            (htmlPluginData: any) => {
              htmlPluginData.html = injectIframe(htmlPluginData.html, this.port)
              return htmlPluginData
            }
          )
        }
      })
    }
  }
}
