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

type Action =
	| { type: 'PENDING' }
	| { type: 'SET'; list: ToDo[] }
	| { type: 'PATCH'; list: ToDo[] }

const action$ = new Subject<Action>()

const state$ = action$.pipe(
	scan(
		(state: State, action: Action) => {
			switch (action.type) {
				case 'PENDING':
					return { ...state, pending: true }
				case 'SET':
					return { list: [...action.list], pending: false }
				case 'PATCH': {
					const list = [...state.list]
					for (const i of action.list) {
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

const dispatch = (act: Action) => action$.next(act)
const create = (name: string) => {
	dispatch({ type: 'PENDING' })
	sdk
		.create({ name, done: false })
		.then(
			r => r.createToDo && dispatch({ list: [r.createToDo], type: 'PATCH' }),
		)
}

const done = (id: number) => {
	dispatch({ type: 'PENDING' })
	sdk
		.done({ id })
		.then(r => r.done && dispatch({ list: [r.done], type: 'PATCH' }))
}

export const useToDos = () => {
	const [todos, settodos] = useState<State>({ pending: true, list: [] })
	useEffect(() => {
		const p = state$.subscribe(s => settodos(s))
		return () => p.unsubscribe()
	}, [])
	useEffect(() => {
		sdk.list().then(r => dispatch({ list: r.todos, type: 'SET' }))
	}, [])

	return {
		list: todos.list,
		isPending: todos.pending,
		create,
		done,
	}
}
