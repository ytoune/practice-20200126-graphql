import { useToDos } from '~/store/todos'
import { ToDo } from '~/components/ToDo'

export const ToDoList = () => {
	const todos = useToDos()
	return (
		<>
			<ul>
				{todos.list.map(t => (
					<ToDo id={t.id} key={t.id} />
				))}
			</ul>
			<style jsx>{`
				ul {
					padding: 10px;
				}
			`}</style>
		</>
	)
}
