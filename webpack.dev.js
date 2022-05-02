const merge = require("webpack-merge"),
      common = require("./webpack.common");

module.exports = merge(common, {
   mode: "development"
});