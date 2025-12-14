import { redirect } from 'next/navigation'

export default function ScriptRedirectPage() {
  redirect('/workspace?section=script')
}
