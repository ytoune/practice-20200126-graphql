import { useReducer, useCallback } from 'react'
import { useToDos } from '~/store/todos'

const useForm = () => {
	const actions = useToDos()
	type Act =
		| {
				type: 'change'
				name: string
		  }
		| {
				type: 'submit'
		  }
	const [name, dispatch] = useReducer((name: string, act: Act) => {
		switch (act.type) {
			case 'change':
				return act.name
			case 'submit': {
				actions.create(name)
				return ''
			}
			default:
				return name
		}
	}, '')
	const onSubmit = useCallback(
		(e: { preventDefault: () => void }) => (
			e.preventDefault(), dispatch({ type: 'submit' })
		),
		[dispatch],
	)
	const onChange = useCallback(
		(e: {
			target: {
				value: string
			}
		}) => dispatch({ type: 'change', name: e.target.value }),
		[dispatch],
	)
	return {
		name,
		onSubmit,
		onChange,
	}
}

export const CreateToDo = () => {
	const todos = useToDos()
	const f = useForm()
	return todos.isPending ? (
		<p>loading...</p>
	) : (
		<form onSubmit={f.onSubmit}>
			<input type="text" value={f.name} onChange={f.onChange} />
			<button type="submit">create</button>
		</form>
	)
}
