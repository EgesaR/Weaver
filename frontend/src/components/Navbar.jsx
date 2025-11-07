import {
  useAuthStore
} from "../store/useAuthStore"
import {
  Link
} from "react-router"
import {
  MessageSquare,
  Settings,
  LogOut,
  User
} from "lucide-react"

export const Navbar = () => {
  const {
    logout,
    authUser
  } = useAuthStore()
  return (
    <header className="bg-neutral-100 border-b border-neutral-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-neutral-100/80">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition">
              <div className="size-9 rounded-lg bg-orange-300/30 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-orange-300" />
              </div>
              <h1 className="text-lg font-bold">Chat Link</h1>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/settings"className="px-2.5 py-1 hover:bg-neutral-300 gap-2 transition-all flex items-center rounded-md">
              <Settings className="size-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {
            authUser && (
              <>
                <Link to="/profile" className="px-2.5 py-1 hover:bg-neutral-300 gap-2 transition-all flex items-center rounded-md">
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <button className="px-2.5 py-1 hover:bg-neutral-300 gap-2 transition-all flex items-center rounded-md" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">LogOut</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar