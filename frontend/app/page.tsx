import Footer from "@/components/footer"
import { Navbar } from "@/components/navbar"

export default function Home() {
  return (
    <main>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Welcome to the Homepage</h1>
        <p className="mt-2">This is a demo page showing the responsive navbar component.</p>
      </div>
      <Footer/>
    </main>
  )
}
