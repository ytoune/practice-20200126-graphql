import { readFileSync } from 'fs'
import { join } from 'path'
import Koa from 'koa'
import { ApolloServer, IResolvers } from 'apollo-server-koa'
import { Resolvers } from './gen/graphql-resolver-types'
import { todos } from './todos'

const typeDefs = readFileSync(join(__dirname, 'gen/schema.gql'), 'utf-8')

// Provide resolver functions for your schema fields
const resolvers: Resolvers = {
	Query: {
		todos: () => todos.list(),
		todo: (_, args) => {
			return todos.find(t => t.id === args.id).then(r => r || null)
		},
	},
	Mutation: {
		createToDo: (_, args) => {
			const { name, done } = args
			if (name && null != done) return todos.create({ name, done })
			throw new TypeError('name and done are required.')
		},
		done: (_, args) => {
			const { id } = args
			if (id) return todos.update({ id, done: true }).then(r => r || null)
			throw new TypeError('id is required.')
		},
	},
}

const server = new ApolloServer({
	typeDefs,
	resolvers: resolvers as IResolvers,
})

export const app = new Koa()
server.applyMiddleware({ app })
// alternatively you can get a composed middleware from the apollo server
// app.use(server.getMiddleware());

export const helloMessage = `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
