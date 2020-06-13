import { useCallback, memo } from 'react'
import { useToDos, ToDo as IToDo } from '~/store/todos'

export const ToDo = memo(({ id }: { id: IToDo['id'] }) => {
	const todos = useToDos()
	const onChange = useCallback(() => {
		todos.done(id)
	}, [id])
	const todo = todos.list.find(t => id === t.id)
	if (!todo) return null
	return (
		<>
			<li>
				<span>
					<input type="checkbox" checked={todo.done} onChange={onChange} />
				</span>
				<span>{todo.name}</span>
			</li>
			<style jsx>{`
				li > span:first-child {
					padding-right: 5px;
				}
			`}</style>
		</>
	)
})
