const path = require('path')
module.exports = {
	webpack(config, _options) {
		config.resolve.alias = {
			...config.resolve.alias,
			'~': path.resolve(__dirname, 'src'),
		}
		return config
	},
}
