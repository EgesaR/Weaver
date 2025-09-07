import {
  useState
} from "react"
import {
  useAuthStore
} from "../store/useAuthStore"
import {
  MessageSquare,
  User,
  Mail,
  EyeOff,
  Eye,
  Lock,
  Loader2
} from "lucide-react"
import {
  Link
} from "react-router"
import AuthImagePattern from "../components/AuthImagePattern"
import toast from "react-hot-toast"

export const LoginPage = () => {
  const [showPassword,
    setShowPassword] = useState(false)
  const [formData,
    setFormData] = useState( {
      email: "",
      password: ""
    })

  const {
    login,
    isLoggingIn
  } = useAuthStore()

  const validateForm = () => {
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Email is invalid");
    if (!formData.password) return toast.error("Password is required");
    console.log(formData.password, formData.password.length)
    if (formData.password.length < 8) return toast.error("Password must be at least 8 characters");

    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const successs = validateForm()
    if (successs === true) login(formData);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden">
      {/* Left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 sm:pt-[14%] h-screen">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-orange-500/10 flex items-center justify-center group:bg-orange-500/20 transition-colors">
                <MessageSquare className="size-6 text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold ml-2">
                Welcome Back
              </h1>
              <p className="text-base/60">
                Sign in to your account
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 mt-5">
              <div className="flex flex-col items-start space-y-1">
                <label>
                  <span className="font-medium">
                    Email
                  </span>
                </label>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Mail className="size-5 text-base/40" />
                  </div>
                  <input type="email" placeholder="someone@gmail.com" className="w-full pl-10 border border-neutral-500/40 py-1.5 rounded-md" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>
            <div className="flex flex-col items-start space-y-1">
              <label>
                <span className="font-medium">
                  Password
                </span>
              </label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base/40" />
                </div>
                <input type={showPassword ? "text": "password" } placeholder="........" className="w-full pl-10 border border-neutral-500/40 py-1.5 rounded-md" value={ formData.password } onChange={ e => setFormData({ ...formData, password: e.target.value })} />
              <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                {
                showPassword ? (<EyeOff className="size-5 text-base/40" />): (<Eye className="size-5 text-base/40" />)
                }
              </button>
            </div>
          </div>
          <button type="submit" className="px-2 py-2 w-full bg-orange-500 hover:bg-orange-600/80 rounded-md flex items-center justify-center gap-1.5" disabled={isLoggingIn}>
            {
            isLoggingIn ? (<>
              <Loader2 className="size-5 animate-spin" />
              <label>Submitting...</label>
            </>): (
              "Sign In"
            )
            }
          </button>
        </form>

        <div className="text-center mt-2">
          <p className="text-base/40">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="text-orange-600">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
  {/* Right Side */}
  <AuthImagePattern
    title="Join our community"
    subtitle="Connect with friends, share moments, and stay in touch with your loved ones." />
</div>
)
}

export default LoginPage