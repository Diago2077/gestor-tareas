import { getTasks } from './actions'
import TasksClient from './TasksClient'

// Force dynamic rendering to ensure fresh data from Supabase
export const dynamic = 'force-dynamic'

export default async function Home() {
  const initialTasks = await getTasks()

  return (
    <TasksClient initialTasks={initialTasks} />
  )
}
