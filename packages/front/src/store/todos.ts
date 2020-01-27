import fetch from 'cross-fetch'
import { useEffect, useCallback, useState } from 'react'
import { Subject } from 'rxjs'
import { scan, shareReplay } from 'rxjs/operators'

export type ToDo = {
	id: number
	name: string
	done: boolean
}

type State = {
	pending: boolean
	list: ToDo[]
}

type Action =
	| { type: 'PENDING' }
	| { type: 'SET'; list: ToDo[] }
	| { type: 'PATCH'; list: ToDo[] }

const query = {
	list: `
		query {
			todos {
				id, name, done
			}
		}
	`,
	create: `
		mutation Create($name: String!, $done: Boolean!) {
			createToDo(name: $name, done: $done) {
				id, name, done
			}
		}
	`,
	done: `
		mutation Done($id: Int!) {
			done(id: $id) {
				id, name, done
			}
		}
	`,
} as const

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
	fetch('//localhost:4000/graphql', {
		method: 'post',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			query: query.create,
			variables: { name, done: false },
		}),
	})
		.then(r => r.json())
		.then(r => dispatch({ list: [r.data.createToDo], type: 'PATCH' }))
}

const done = (id: number) => {
	dispatch({ type: 'PENDING' })
	fetch('//localhost:4000/graphql', {
		method: 'post',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			query: query.done,
			variables: { id },
		}),
	})
		.then(r => r.json())
		.then(r => dispatch({ list: [r.data.done], type: 'PATCH' }))
}

export const useToDos = () => {
	const [todos, settodos] = useState<State>({ pending: true, list: [] })
	useEffect(() => {
		const p = state$.subscribe(s => settodos(s))
		return () => p.unsubscribe()
	}, [])
	useEffect(() => {
		fetch('//localhost:4000/graphql', {
			method: 'post',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ query: query.list }),
		})
			.then(r => r.json())
			.then(r => dispatch({ list: r.data.todos, type: 'SET' }))
	}, [])
	return {
		list: todos.list,
		isPending: todos.pending,
		create,
		done,
	}
}
