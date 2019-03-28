const path = require('path');

module.exports = {
		
  mode: "development",
  entry: {
	    main:        './src/index.jsx',
	    products:    './src/Products.jsx',
  },
  output: {
    path: path.resolve(__dirname, 'build/js'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: ['src', 'node_modules' ]
  },
  
  module: {
	    rules: [
	      {
	        test: /\.jsx$/,
	        exclude: /node_modules/,
	        use: {
	          loader: "babel-loader"
	        }
	      },
	      {
	        test: /\.js$/,
	        exclude: /node_modules/,
	        use: {
	          loader: "babel-loader"
	        }
	      },
          {
              test:/\.css$/,
              use:['style-loader','css-loader']
          }
	    ]
   },
  
  devtool: "source-map"

};

