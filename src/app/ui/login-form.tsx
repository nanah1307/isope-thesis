

export default function LoginForm() {
  return (
    <form className="flex mt-5 flex-col space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Email</span>
        <input
          type="email"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Password</span>
        <input
          type="password"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </label>
      
      <button
        type="submit"
        className="w-full mt-10 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Log in
      </button>
      <button
        type="submit"
        className="w-full mt-3 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Log in with Google
      </button>
    </form>
  );
}