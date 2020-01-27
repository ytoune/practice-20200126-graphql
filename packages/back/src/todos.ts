class Repo<Item extends { id: number }, Required extends keyof Item> {
	private pkey = 'id' as const
	private cur = 1
	private readonly items: Item[] = []
	constructor(private init: () => Omit<Item, 'id'>) {}
	async list(): Promise<readonly Item[]> {
		return this.items
	}
	async find(fn: (i: Item) => boolean): Promise<Item | undefined> {
		return this.items.find(fn)
	}
	async create(
		i: Pick<Item, Required> & Partial<Omit<Item, 'id'>>,
	): Promise<Item> {
		const cur = this.cur++
		const item = { ...this.init(), [this.pkey]: cur, ...i } as Item
		this.items.push(item)
		return item
	}
	async update(i: Pick<Item, 'id'> & Partial<Item>): Promise<Item | undefined> {
		const idx = this.items.map(i => i.id).indexOf(i.id)
		if (!~idx) return
		const updated = (this.items[idx] = { ...this.items[idx], ...i })
		return updated
	}
	async remove(id: number): Promise<Item | undefined> {
		const idx = this.items.map(i => i.id).indexOf(id)
		if (!~idx) return
		const removed = this.items.splice(idx, 1)
		return removed[0]
	}
}

export interface ToDo {
	id: number
	name: string
	done: boolean
}

export const todos = new Repo<ToDo, 'name'>(() => ({ name: '', done: false }))

todos.create({ name: 'run' })
todos.create({ name: 'walk' })
