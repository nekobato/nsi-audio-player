const path = require("path");

module.exports = {
  entry: {
    index: "./src/index.ts",
  },
  output: {
    path: path.join(__dirname, "./dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              plugins: ["@babel/plugin-proposal-optional-chaining"],
            },
          },
          {
            loader: "ts-loader",
          },
        ],
      },
      {
        test: /\.pcss$/,
        use: ["raw-loader", "postcss-loader"],
      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, "."),
    compress: true,
    port: 9000,
  },
};
