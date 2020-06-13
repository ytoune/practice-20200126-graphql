import { useEffect, useState } from 'react'
import { Subject } from 'rxjs'
import { scan, shareReplay } from 'rxjs/operators'
import { GraphQLClient } from 'graphql-request'
import { getSdk, ToDo as IToDo } from '~/gen/graphql-client-api'

const sdk = getSdk(new GraphQLClient('http://localhost:4000/graphql'))

export type ToDo = Omit<IToDo, '__typename'>

type State = {
	pending: boolean
	list: ToDo[]
}

type Mutation =
	| { type: 'PENDING' }
	| { type: 'SET'; list: ToDo[] }
	| { type: 'PATCH'; list: ToDo[] }

const mutation$ = new Subject<Mutation>()

const state$ = mutation$.pipe(
	scan(
		(state: State, mutation: Mutation) => {
			switch (mutation.type) {
				case 'PENDING':
					return { ...state, pending: true }
				case 'SET':
					return { list: [...mutation.list], pending: false }
				case 'PATCH': {
					const list = [...state.list]
					for (const i of mutation.list) {
						const x = list.map(i => i.id).indexOf(i.id)
						~x ? (list[x] = i) : list.push(i)
					}
					return { list, pending: false }
				}
				default:
					return { ...state }
			}
		},
		{ pending: true, list: [] },
	),
	shareReplay<State>(1),
)

state$.subscribe()

const handleError = (x: unknown) => {
	console.error(x)
	commit({ list: [], type: 'PATCH' })
}

const commit = (mut: Mutation) => mutation$.next(mut)
const create = (name: string) => {
	if (!name) return
	commit({ type: 'PENDING' })
	sdk
		.create({ name, done: false })
		.then(
			r => r.createToDo && commit({ list: [r.createToDo], type: 'PATCH' }),
			handleError,
		)
}

const done = (id: number) => {
	if (id < 1) return
	commit({ type: 'PENDING' })
	sdk
		.done({ id })
		.then(r => r.done && commit({ list: [r.done], type: 'PATCH' }), handleError)
}

const refresh = () => {
	sdk.list().then(r => commit({ list: r.todos, type: 'SET' }), handleError)
}

let inited = false

export const useToDos = () => {
	const [todos, settodos] = useState<State>({ pending: true, list: [] })
	useEffect(() => {
		const p = state$.subscribe(s => settodos(s))
		return () => p.unsubscribe()
	}, [])
	useEffect(() => {
		if (inited) return
		inited = true
		refresh()
	}, [])

	return {
		list: todos.list,
		isPending: todos.pending,
		create,
		done,
		refresh,
	}
}
