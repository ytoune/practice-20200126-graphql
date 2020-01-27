import { app, helloMessage } from './app'

const main = async () => {
	app.listen({ port: 4000 }, () => console.log(helloMessage))
}

main().catch(x => {
	console.log('# something happens.')
	console.error(x)
	if ('undefined' === typeof process) return
	process.exit(1)
})
