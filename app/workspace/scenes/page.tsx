import { redirect } from 'next/navigation'

export default function ScenesRedirectPage() {
  redirect('/workspace?section=scenes')
}
