import Koa from 'koa'
import { ApolloServer, gql, IResolvers } from 'apollo-server-koa'
import { todos } from './todos'

const typeDefs = gql`
	type Query {
		todos: [ToDo]!
		todo(id: Int): ToDo
	}
	type Mutation {
		createToDo(name: String, done: Boolean): ToDo
		done(id: Int): ToDo
	}
	type ToDo {
		id: Int!
		name: String!
		done: Boolean!
	}
`

// Provide resolver functions for your schema fields
const resolvers: IResolvers = {
	Query: {
		todos: () => todos.list(),
		todo: (parent, args) => {
			return todos.find(t => t.id === args.id)
		},
	},
	Mutation: {
		createToDo: (parent, args) => {
			const { name, done } = args
			return todos.create({ name, done })
		},
		done: (parent, args) => {
			const { id } = args
			return todos.update({ id, done: true })
		},
	},
}

const server = new ApolloServer({ typeDefs, resolvers })

export const app = new Koa()
server.applyMiddleware({ app })
// alternatively you can get a composed middleware from the apollo server
// app.use(server.getMiddleware());

export const helloMessage = `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
