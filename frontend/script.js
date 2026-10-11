
import gsap from 'https://esm.sh/gsap@3.11.0';
import ScrollTrigger from 'https://esm.sh/gsap@3.11.0/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* =========================================
   CAREERLENS CONFIGURATION
========================================= */

const config = {
    theme: 'dark',
    animate: true,
    snap: false,
    start: 200,
    end: 320,
    scroll: true,
    debug: false
};

const root = document.documentElement;
const items = gsap.utils.toArray('.content ul li');

let dimmerScrub;
let scrollerScrub;
let chromaEntry;
let chromaExit;

const nativeScrollSupported =
    CSS.supports('animation-timeline: view()') &&
    CSS.supports('animation-range: 0% 100%');

const useGsapFallback = !nativeScrollSupported;

/* =========================================
   APPLY PAGE SETTINGS
========================================= */

function updateSettings() {
    root.dataset.theme = config.theme;
    root.dataset.animate = String(config.animate);
    root.dataset.snap = String(config.snap);
    root.dataset.debug = String(config.debug);
    root.dataset.syncScrollbar = String(config.scroll);

    root.style.setProperty('--start', config.start);
    root.style.setProperty('--end', config.end);
}

/* =========================================
   GSAP FALLBACK
   Used when native scroll animations
   are not supported by the browser.
========================================= */

if (useGsapFallback && items.length > 0) {

    gsap.set(items, {
        opacity: index => index === 0 ? 1 : 0.2
    });

    const dimmer = gsap.timeline()
        .to(items.slice(1), {
            opacity: 1,
            stagger: 0.5
        })
        .to(items.slice(0, -1), {
            opacity: 0.2,
            stagger: 0.5
        }, 0);

    dimmerScrub = ScrollTrigger.create({
        trigger: items[0],
        endTrigger: items[items.length - 1],
        start: 'center center',
        end: 'center center',
        animation: dimmer,
        scrub: 0.2
    });

    const hueTimeline = gsap.timeline()
        .fromTo(root,
            { '--hue': config.start },
            {
                '--hue': config.end,
                ease: 'none'
            }
        );

    scrollerScrub = ScrollTrigger.create({
        trigger: items[0],
        endTrigger: items[items.length - 1],
        start: 'center center',
        end: 'center center',
        animation: hueTimeline,
        scrub: 0.2
    });

    chromaEntry = gsap.fromTo(root,
        { '--chroma': 0 },
        {
            '--chroma': 0.3,
            ease: 'none',
            scrollTrigger: {
                trigger: items[0],
                start: 'center center+=40',
                end: 'center center',
                scrub: 0.2
            }
        }
    );

    chromaExit = gsap.fromTo(root,
        { '--chroma': 0.3 },
        {
            '--chroma': 0,
            ease: 'none',
            scrollTrigger: {
                trigger: items[Math.max(0, items.length - 2)],
                start: 'center center',
                end: 'center center-=40',
                scrub: 0.2
            }
        }
    );
}

/* =========================================
   INITIALIZE
========================================= */

updateSettings();

if (useGsapFallback) {
    ScrollTrigger.refresh();
}
