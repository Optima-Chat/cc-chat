import Link from 'next/link'
import LoginButton from './LoginButton'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="#111827"/>
            <path d="M12 14C12 12.8954 12.8954 12 14 12H18C19.1046 12 20 12.8954 20 14V18C20 19.1046 19.1046 20 18 20H14C12.8954 20 12 19.1046 12 18V14Z" fill="#F97316"/>
            <path d="M22 22C22 20.8954 22.8954 20 24 20H26C27.1046 20 28 20.8954 28 22V26C28 27.1046 27.1046 28 26 28H24C22.8954 28 22 27.1046 22 26V22Z" fill="#3B82F6"/>
            <circle cx="16" cy="26" r="2" fill="#10B981"/>
            <circle cx="26" cy="16" r="2" fill="#EAB308"/>
          </svg>
          <span className="text-xl font-bold text-gray-900">CC Chat</span>
        </Link>
        <LoginButton />
      </div>
    </header>
  )
}
