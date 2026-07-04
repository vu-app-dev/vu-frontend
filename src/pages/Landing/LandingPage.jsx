import CardNav from '../../components/reactbits/CardNav';
import CardSwap, { Card } from '../../components/reactbits/CardSwap';
import FlowingMenu from '../../components/reactbits/FlowingMenu';
import PixelBlast from '../../components/reactbits/PixelBlast';
import Prism from '../../components/reactbits/Prism';
import RotatingText from '../../components/reactbits/RotatingText';
import ScrollFloat from '../../components/reactbits/ScrollFloat';
import { AppLogo } from '../../components/ui/AppLogo';
import './LandingPage.css';

const flowingMenuItems = [
  { link: '#', text: 'Mojave', image: 'https://picsum.photos/600/400?random=1' },
  { link: '#', text: 'Sonoma', image: 'https://picsum.photos/600/400?random=2' },
  { link: '#', text: 'Monterey', image: 'https://picsum.photos/600/400?random=3' },
  { link: '#', text: 'Sequoia', image: 'https://picsum.photos/600/400?random=4' },
];

export function LandingPage() {
  return (
    <div className="landing-root">
      <main className="landing-showcase">
        {/* <section className="landing-section">
          <div className="landing-prism-stage">
            <Prism
              animationType="rotate"
              timeScale={0.5}
              height={3.5}
              baseWidth={5.5}
              scale={3.6}
              hueShift={0}
              colorFrequency={1}
              noise={0}
              glow={1}
            />
          </div>
        </section> */}
        <section className="landing-hero">
          <div className="landing-prism-bg">
            <Prism speed={5} scale={1} color="#383838" noiseIntensity={1.5} rotation={0} />
          </div>

          <div className="landing-hero-content">
            <CardNav />
            <AppLogo />
            {/* <RotatingText ... /> */}

            {/* Buttons */}
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-rotating-stage">
            <RotatingText
              texts={['React', 'Bits', 'Is', 'Cool!']}
              staggerFrom={'first'}
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-120%', opacity: 0 }}
              staggerDuration={0}
              splitBy="characters"
              rotationInterval={2000}
              animatePresenceMode="wait"
              animatePresenceInitial={false}
              auto={true}
            />
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-card-swap-stage">
            <CardSwap cardDistance={60} verticalDistance={70} delay={5000} pauseOnHover={false}>
              <Card>
                <h3>Card 1</h3>
                <p>Your content here</p>
              </Card>
              <Card>
                <h3>Card 2</h3>
                <p>Your content here</p>
              </Card>
              <Card>
                <h3>Card 3</h3>
                <p>Your content here</p>
              </Card>
            </CardSwap>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-flowing-menu-stage">
            <FlowingMenu items={flowingMenuItems} />
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-pixel-stage">
            <PixelBlast />
          </div>
        </section>

        <section className="landing-section landing-section--scroll-float">
          <ScrollFloat>Scroll Float</ScrollFloat>
        </section>
      </main>
    </div>
  );
}
