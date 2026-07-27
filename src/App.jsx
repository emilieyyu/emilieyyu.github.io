import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import HikesMap from './components/HikesMap';
import Travel from './components/Travel';
import Builds from './components/Builds';
import Experience from './components/Experience';
import Contact from './components/Contact';

function App() {
  return (
    <main className="bg-background text-off-white selection:bg-accent selection:text-white antialiased">
      <Navbar />
      <Hero />
      <About />
      <div id="adventures">
        <HikesMap />
        <Travel />
      </div>
      <Builds />
      <Experience />
      <Contact />
    </main>
  );
}

export default App;
