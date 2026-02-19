"use client"
import Link from "next/link"

export default function Navbar() {

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="flex items-center justify-between h-14 px-6">
        {/* <nav className="h-14.5 border-b flex items-center px-6 justify-between"> */}
          <div className="font-semibold">Navigate Code</div>

          <div className="flex gap-6 text-sm">
            <Link href="/">Home</Link>
            <Link href="/repos">Repositories</Link>
            <Link href="/upload">Upload</Link>
            <Link href="/health">Health</Link>
          </div>
        {/* </nav> */}

      </div>
    </header>
  )
}
