import { About } from '@/sections/About'
import { BeforeAfter } from '@/sections/BeforeAfter'
import { Booking } from '@/sections/Booking'
import { Calculator } from '@/sections/Calculator'
import { Faq } from '@/sections/Faq'
import { Footer } from '@/sections/Footer'
import { Header } from '@/sections/Header'
import { Hero } from '@/sections/Hero'
import { Reviews } from '@/sections/Reviews'
import { Services } from '@/sections/Services'

export default function App() {
  return (
    <>
      <Header />
      {/* tabIndex −1: ссылка «К содержимому» переводит сюда фокус, а не только прокрутку */}
      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Services />
        <BeforeAfter />
        <Calculator />
        <Reviews />
        <Faq />
        <Booking />
      </main>
      <Footer />
    </>
  )
}
