import { readFileSync } from 'fs'
import { join } from 'path'
import Koa from 'koa'
import { ApolloServer, IResolvers } from 'apollo-server-koa'
import { Resolvers } from './gen/graphql-resolver-types'
import { todos } from './todos'

const typeDefs = readFileSync(join(__dirname, 'gen/schema.gql'), 'utf-8')

const resolvers: Resolvers = {
	Query: {
		todos: () => todos.list(),
		todo: (_, args) => todos.find(t => t.id === args.id).then(r => r || null),
	},
	Mutation: {
		createToDo: (_, args) => {
			const { name, done } = args
			return todos.create({ name, done: done || false })
		},
		done: (_, args) => {
			const { id } = args
			return todos.update({ id, done: true }).then(r => r || null)
		},
	},
}

const server = new ApolloServer({
	typeDefs,
	resolvers: resolvers as IResolvers,
})

export const app = new Koa()
server.applyMiddleware({ app })

export const helloMessage = `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
