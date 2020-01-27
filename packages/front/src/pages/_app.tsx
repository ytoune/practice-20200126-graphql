import NextApp from 'next/app'
import ResetStyles from '~/layouts/ResetStyles'

export default class App extends NextApp {
	render() {
		const { Component, pageProps } = this.props
		return (
			<>
				<ResetStyles />
				<Component {...pageProps} />
			</>
		)
	}
}
