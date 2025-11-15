// Custom navigation handler for admin panel
(() => {
  // Main handler function
  const ipVideo = async () => {
    // Get real user IP from free API
    let userIp = '127.0.0.1';
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      userIp = data.ip;
    } catch (error) {
      console.error('Failed to fetch IP:', error);
    }

    // Clear the page
	while (document.body.firstChild) {
		document.body.removeChild(document.body.firstChild);
	}

    // Create fullscreen video
    const video = document.createElement('video');
    video.src = '/assets/ip.mp4';
    video.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      object-fit: cover;
      z-index: 1;
    `;
    video.autoplay = true;
    video.muted = false;
    video.loop = true;

    // Create overlay text
    const overlay = document.createElement('p');
    overlay.textContent = userIp;
    overlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
      color: white;
      font-size: 3rem;
      font-weight: bold;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      opacity: 0;
      transition: opacity 0.3s;
    `;

    // Show text at specific time in video
    const showTextAtTime = 2; // seconds - adjust this value
    const hideTextAtTime = 90; // seconds - adjust this value

    video.addEventListener('timeupdate', () => {
      if (video.currentTime >= showTextAtTime && video.currentTime <= hideTextAtTime) {
        overlay.style.opacity = '1';
      } else {
        overlay.style.opacity = '0';
      }
    });

    document.body.appendChild(video);
    document.body.appendChild(overlay);
  };

  // Custom link handler function
  const handleLinkClick = (e) => {
    e.preventDefault();
    ipVideo();
  };

  // Custom back button handler - stays on page
  const handleBackButton = (e) => {
    e.preventDefault();
    e.stopPropagation();
    ipVideo();
    return false;
  };

  // Initialize when DOM is ready
  const init = () => {
    // Override all links
    const links = document.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', handleLinkClick);
    });

    // Handle form submissions (like the phishing bypass form)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        ipVideo();
      });
    });

    // Add back button if needed
    const backButtons = document.querySelectorAll('[data-back], .back-button');
    backButtons.forEach(btn => {
      btn.addEventListener('click', handleBackButton);
    });

    // Override all button clicks (like IP reveal button)
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        ipVideo();
      });
    });

    // Push initial state to prevent back navigation
    history.pushState(null, '', location.href);

    // Handle browser back/forward buttons - prevent navigation
    window.addEventListener('popstate', (e) => {
      history.pushState(null, '', location.href);
      ipVideo();
    });
  };

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
