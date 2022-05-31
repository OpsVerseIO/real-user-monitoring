const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, ""),
    library: "OpsVerseRum",
    libraryTarget: "umd", //exposes and knows when to use module.exports or exports
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js$/, //Regular expression
        exclude: /(node_modules)/, //excluded node_modules
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"], //Preset used for env setup
          },
        },
      },
    ],
  },
};
