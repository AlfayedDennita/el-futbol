const HtmlWebpackPlugin = require("html-webpack-plugin"),
      CopyWebpackPlugin = require("copy-webpack-plugin"),
      {CleanWebpackPlugin} = require("clean-webpack-plugin"),
      path = require("path");

module.exports = {
   entry: {
      main: "./src/main.js",
      detailKlub: "./src/detail-klub.js"
   },
   output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].bundle.js"
   },
   module: {
      rules: [
         {
            test: /\.css$/i,
            use: ["style-loader", "css-loader"]
         },
         {
            test: /\.(gif|png|jpe?g|svg)$/i,
            use: "file-loader?name=images/[name].[ext]"
         }
      ]
   },
   plugins: [
      new HtmlWebpackPlugin({
         template: "./src/index.html",
         filename: "index.html",
         chunks: ["main"]
      }),
      new HtmlWebpackPlugin({
         template: "./src/detail-klub.html",
         filename: "detail-klub.html",
         chunks: ["detailKlub"]
      }),
      new CopyWebpackPlugin({
         patterns: [
            {from: "src/service-worker.js", to: "service-worker.js"},
            {from: "src/manifest.json", to: "manifest.json"},
            {from: "src/halaman", to: "halaman"},
            {from: "src/images", to: "images"},
         ]
      }),
      new CleanWebpackPlugin()
   ]
}