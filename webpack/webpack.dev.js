import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import prodCfg from './webpack.prod.config.js'

export default function devConfig(app) {
  const config = {
    ...prodCfg,
    devtool: 'cheap-module-eval-source-map',
    mode: 'development',
    entry: ['webpack-hot-middleware/client.js', './entry/client.js'],
    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: 'pre',
          exclude: /node_modules/,
          loader: 'eslint-loader'
        },
        {
          test: /\.js$/,
          exclude: /react-onclickoutside/,
          include: [/source/, /entry/],
          loader: 'babel-loader',
          options: {
            presets: [['es2015', { modules: false }], 'react'],
            plugins: [
              ['transform-object-rest-spread'],
              ['transform-class-properties'],
              [
                'react-transform',
                {
                  transforms: [
                    {
                      transform: 'react-transform-hmr',
                      imports: ['react'],
                      locals: ['module']
                    }
                  ]
                }
              ]
            ]
          }
        }
      ]
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin()
    ]
  }

  const compiler = webpack(config)

  app.use(webpackDevMiddleware(compiler, { noInfo: false }))
  app.use(webpackHotMiddleware(compiler))
}
