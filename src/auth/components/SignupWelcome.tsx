import { useMutation } from "@blitzjs/rpc";
import updateFirstSignup from "src/users/mutations/updateFirstSignup"
import { useEffect } from "react"

const SignupWelcome = ({ setOpenModal, userName, userId }) => {
  const [updateFirstSignupMutation] = useMutation(updateFirstSignup)

  useEffect(() => {
    try {
      updateFirstSignupMutation({ userId, isFirstSignup: false })
    } catch (e) {}
  }, [])

  return (
    <div className="bg-white rounded-lg flex flex-col items-center justify-center space-y-8 h-auto w-96 px-7 py-10">
      <div className="w-full text-center text-neutral-800 text-xl flex flex-col">
        <span>Welcome, {userName}!</span>
        <span>{"We're"} so happy to have you here.</span>
      </div>

      <div className="flex items-center justify-center space-x-3 text-8xl">
        <span>🎊</span>
        <span>🍰</span>
      </div>

      <div className="w-full text-center text-7xl font-bold text-neutral-800">Party!</div>

      <div className="flex items-center justify-center space-x-3 text-8xl">
        <span>🧁</span>
        <span>🎉</span>
      </div>

      <div className="w-full text-center text-neutral-800 text-xl flex flex-col">
        <span>We just created a sample job for you and it is live on your careers page!</span>
      </div>

      <div>
        <button
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xl"
          onClick={() => {
            setOpenModal(false)
          }}
        >
          Start using Hire.win...
        </button>
      </div>
    </div>
  )
}

export default SignupWelcome
