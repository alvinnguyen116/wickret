import React, {useState, useEffect} from 'react';
import {scaleQuantize, scaleLinear} from 'd3-scale';
import { Icon, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { CSSTransition } from 'react-transition-group';
import {debounce} from 'lodash';
import './App.scss';

function App() {
    // Quantized scale from scroll position to landing page titles
    const LANDING_PAGE_TITLES = ["Reimagined", "Easy", "Fun", "Wickret"];
    const SCROLL_DOMAIN = [0, 800];
    const landingPageTitle = scaleQuantize()
        .domain(SCROLL_DOMAIN)
        .range(LANDING_PAGE_TITLES);

    // Domain for cursor scales
    const CURSOR_X_DOMAIN = [0, window.screen.width];
    const CURSOR_Y_DOMAIN = [0, window.screen.height];

    // Translate 3D transforms:
    const translateX = scaleLinear()
        .domain(CURSOR_X_DOMAIN)
        .range([-30,30]);
    const translateY = scaleLinear()
        .domain(CURSOR_Y_DOMAIN)
        .range([-20,20]);

    // Matrix 3D transforms:
    const rotateA1 = scaleLinear()
        .domain([0, window.screen.width/2])
        .range([.999391,1]);

    const rotateC1 = scaleLinear()
        .domain(CURSOR_X_DOMAIN)
        .range([.035,-.035]);

    const rotateA3 = scaleLinear()
        .domain(CURSOR_X_DOMAIN)
        .range([-.035,.035]);

    const rotateA4 = scaleLinear()
        .domain(CURSOR_X_DOMAIN)
        .range([20,-20]);

    const rotateB4 = scaleLinear()
        .domain(CURSOR_Y_DOMAIN)
        .range([10,-10]);

    const [currentScrollY, setCurrentScrollY] = useState(0);
    const [currentMouseCoords, setCurrentMouseCoords] = useState({x: 0, y: 0});
    const [scrollTriggered, setScrollTriggered] = useState(false);
    const [cursorSize, setCursorSize] = useState({scaleX: 1, scaleY: 1});
    const [currentSectionRotate, setCurrentSectionRotate] = useState(0);
    const [showMobile, setShowMobile] = useState(false);

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        document.addEventListener("wheel", handleScroll, {passive: false});
        return () => document.removeEventListener("wheel", handleScroll);
    }, [currentScrollY]);

    const handleMouseMove = e => {
      const {pageX : x, pageY: y} = e;
      setCurrentMouseCoords({x,y});
    };

    const handleScroll = e => {
        const newPos = e.deltaY + currentScrollY;
        setCurrentScrollY(newPos < 0 ? 0 : newPos);
        setScrollTriggered(true);
        if (e.deltaY > 0) {
            setCurrentSectionRotate(.5);
        } else {
            setCurrentSectionRotate(-.5);
        }
        setTimeout(() => {
            setScrollTriggered(false);
        }, 100);
        setTimeout(() => {
            setCurrentSectionRotate(0);
        }, 250);
    };

    const increaseCursorSize = () => {
        console.log("up");
        setCursorSize({scaleX: 4, scaleY: 4});
    };

    const decreaseCursorSize = () => {
        console.log("down");
        setCursorSize({scaleX: 1, scaleY: 1});
    };


    const NavBar = (
        <nav className={"nav-bar"}>
            <div className={"logo"}>
              WICKRET
            </div>
            <div className={"right"}>
                <div onMouseEnter={increaseCursorSize} onMouseLeave={decreaseCursorSize}>
                    Benefits
                </div>
                <div onMouseEnter={increaseCursorSize} onMouseLeave={decreaseCursorSize}>
                    Security
                </div>
            </div>
            <span className={"menu"} onClick={() => {setShowMobile(!showMobile);}}>
                <Icon icon={showMobile ? IconNames.CROSS : IconNames.MENU}/>
            </span>
        </nav>
    );

    const calculateCursorStyle = () => {
        const {x,y} = currentMouseCoords;
        const padding = 20;
        let scaleX = cursorSize.scaleX;
        let scaleY = cursorSize.scaleY;
        if (x < padding || y < padding) {
            scaleX = 0;
            scaleY = 0;
        } else if ((scaleX === 0 && x > padding) || (scaleY === 0 && y > padding)) {
            scaleX = 1;
            scaleY = 1;
        }
        return {
            left: x,
            top: y,
            transform: `translate(-50%,-50%) scale(${scaleX},${scaleY})`
        };
    };

    const calculateAppStyle = () => {
        return {
          top: currentScrollY*(-1/2)
        };
    };

    const calculateScrollbarStyle = () => {
        let scrollTop = currentScrollY*(1/4);
        if (scrollTop < 0) scrollTop = 0;
        return {
            opacity: scrollTriggered ? 1 : 0,
            transitionDelay: scrollTriggered ? "0s" : "3s",
            top: scrollTop
        }
    };

    const calculateLandingStyle = () => {
        const {height, width} = window.screen;
        const x = currentMouseCoords.x - width/2 + 10;
        const y = currentMouseCoords.y - height/2 + 80;
        return {
          backgroundPositionX: x,
          backgroundPositionY: y
        };
    };

    const calculateSectionStyle = () => {
      return {
          transform: `skewY(${currentSectionRotate}deg)`
      }
    };

    const calculateHeaderStyle = () => {
        let {x,y} = currentMouseCoords;
        const c1 = rotateC1(x);
        const a3 = rotateA3(x);
        const a4 = rotateA4(x);
        const b4 = rotateB4(y);
        if (x > window.screen.width/2) {
            x = window.screen.width - x;
        }
        const a1 = rotateA1(x);
        return {
          transform: `matrix3d(${a1},0,${c1},0,0,1,0,0,${a3},0,${a1},0,${a4},${b4},0,1)`
        };
    };

    const calculateIconStyle = () => {
        const y = translateY(currentMouseCoords.y)*(-1);
        const x = translateY(currentMouseCoords.x)*(-1);
        return {
            transform: `translate3d(${x}px,${y}px,0)`
        }
    };

    const iconStyle = calculateIconStyle();
    const Section_2 = (
        <div className={"page section-2"} style={calculateSectionStyle()}>
            <header style={calculateHeaderStyle()}>
                <h1>
                    It's Your Money
                </h1>
                <h1>
                    Stop paying fees
                </h1>
                <h2>
                    Fee Free Banking is possible
                </h2>
                <Icon
                    style={iconStyle}
                    className={"icon-1"}
                    icon={IconNames.BANK_ACCOUNT}
                    intent={Intent.PRIMARY}/>
                <Icon
                    style={iconStyle}
                    className={"icon-2"}
                    icon={IconNames.HAND}
                    intent={Intent.PRIMARY}/>
                <Icon
                    style={iconStyle}
                    className={"icon-3"}
                    icon={IconNames.DOLLAR}
                    intent={Intent.PRIMARY}/>
                <Icon
                    style={iconStyle}
                    className={"icon-4"}
                    icon={IconNames.BRIEFCASE}
                    intent={Intent.PRIMARY}/>
                <Icon
                    style={iconStyle}
                    className={"icon-5"}
                    icon={IconNames.DOLLAR}
                    intent={Intent.PRIMARY}/>
                <Icon
                    style={iconStyle}
                    className={"icon-6"}
                    icon={IconNames.BANK_ACCOUNT}
                    intent={Intent.PRIMARY}/>
                <Icon
                    style={iconStyle}
                    className={"icon-7"}
                    icon={IconNames.BRIEFCASE}
                    intent={Intent.PRIMARY}/>
                <Icon
                    style={iconStyle}
                    className={"icon-8"}
                    icon={IconNames.HAND}
                    intent={Intent.PRIMARY}/>
            </header>
        </div>
    );
    
    const MobileNav = (
        <CSSTransition
            key={0}
            in={showMobile}
            unmountOnExit={true}
            mountOnEnter={true}
            classNames="mobile"
            timeout={250}>
            <div className={"mobile-nav"}>
                <div>Benefits</div>
                <div>Security</div>
            </div>
        </CSSTransition>
    );

    return (
        <>
            <div className={"scroll-bar"} style={calculateScrollbarStyle()}/>
            <div className={"custom-cursor"} style={calculateCursorStyle()}/>
            {MobileNav}
            <div className="app" style={calculateAppStyle()}>
                {NavBar}
                <div className={"download"}>
                    <div className={"first"}>Download</div>
                    <div className={"second"}>Download</div>
                </div>
                <div className={"page landing"} style={calculateLandingStyle()}>
                    <header>
                        <h1>Banking</h1>
                        <h1>{landingPageTitle(currentScrollY)}</h1>
                    </header>
                </div>
                {Section_2}
            </div>
        </>
    );
}

export default App;
