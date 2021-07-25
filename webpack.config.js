const nodeExternals = require( 'webpack-node-externals' );
const path = require( 'path' );

////////////////////////////////////////

module.exports =
{
	entry: './src/Main.ts',
	output:
	{
		path: path.resolve( __dirname, 'build' ), // <-- Important
		libraryTarget: 'this' // <-- Important
	},
	target: 'node', // <-- Important
	mode: 'production',
	devtool: "inline-source-map",
	module:
	{
		rules:
		[
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
			}
		]
	},
	resolve:
	{
		extensions: [ '.ts', '.js' ]
	},
	externals: [ nodeExternals() ] // <-- Important
};