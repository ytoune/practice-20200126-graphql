import { useState, useCallback, memo } from 'react'
import { useToDos } from '~/store/todos'
import { ToDo } from '~/components/ToDo'

export const ToDoList = memo(() => {
	const [checked, set] = useState(false)
	const onChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			set(e.target.checked)
		},
		[set],
	)

	const todos = useToDos()
	return (
		<>
			<div>
				<p>
					<label htmlFor="show-all">
						<input
							type="checkbox"
							id="show-all"
							checked={checked}
							onChange={onChange}
						/>
						show all
					</label>
				</p>
				<ul>
					{todos.list
						.filter(t => checked || !t.done)
						.map(t => (
							<ToDo id={t.id} key={t.id} />
						))}
				</ul>
			</div>
			<style jsx>{`
				ul {
					padding: 10px;
				}
			`}</style>
		</>
	)
})
