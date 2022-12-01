const exec = () => {
  const devtools: {
    isOpen: boolean;
    orientation: 'vertical' | 'horizontal' | undefined;
  } = {
    isOpen: false,
    orientation: undefined
  };
  const threshold = 160;
  const emitEvent = (isOpen: boolean, orientation: typeof devtools.orientation) => {
    window.dispatchEvent(
      new window.CustomEvent('devtoolschange', {
        detail: {
          isOpen,
          orientation
        }
      })
    );
  };
  const main = ({ emitEvents = true } = {}) => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    const orientation = widthThreshold ? 'vertical' : 'horizontal';

    if (
      !(heightThreshold && widthThreshold) &&
      (((window as any).Firebug &&
        (window as any).Firebug.chrome &&
        (window as any).Firebug.chrome.isInitialized) ||
        widthThreshold ||
        heightThreshold)
    ) {
      if ((!devtools.isOpen || devtools.orientation !== orientation) && emitEvents) {
        emitEvent(true, orientation);
      }

      devtools.isOpen = true;
      devtools.orientation = orientation;
    } else {
      if (devtools.isOpen && emitEvents) {
        emitEvent(false, undefined);
      }

      devtools.isOpen = false;
      devtools.orientation = undefined;
    }
  };
  main({ emitEvents: false });
  setInterval(main, 500);
  function check() {
    if (devtools.isOpen) {
      while (true) {
        console.error('ERROR');
      }
    }
  }
  check();
  setInterval(check, 1000);
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
  document.onkeydown = function (e) {
    if (e.keyCode == 123) {
      return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
      return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
      return false;
    }
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
      return false;
    }
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
      return false;
    }
  };
};
export default exec;
