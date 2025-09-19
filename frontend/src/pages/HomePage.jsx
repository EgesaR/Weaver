import { useChatStore } from  "../store/useChatStore"

export const HomePage = () => {
  const { selectedUser } = useChatStore()
  return (
    <div className="h-screen bg-neutral-200">
      <div className="flex">
        HomePage
      </div>
    </div>
  )
}

export default HomePage