import { CreateToDo } from '~/components/CreateToDo'
import { ToDoList } from '~/components/ToDoList'

const Home = () => {
	return (
		<>
			<h1>todos</h1>
			<ToDoList />
			<CreateToDo />
			<style jsx>{`
				h1 {
					padding: 10px;
				}
			`}</style>
		</>
	)
}

export default Home
