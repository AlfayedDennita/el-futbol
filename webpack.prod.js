const merge = require("webpack-merge"),
      common = require("./webpack.common");

module.exports = merge(common, {
   mode: "production",
   module: {
      rules: [
         {
            test: /\.js$/,
            exclude: "/node_modules/",
            use: {
               loader: "babel-loader",
               options: {
                  presets: ["@babel/preset-env"]
               }
            }            
         }
      ]
   }
});