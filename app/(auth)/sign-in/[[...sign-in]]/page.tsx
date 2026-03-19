import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center">
      <SignIn />
    </main>
  )
}
