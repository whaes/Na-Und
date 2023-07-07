// script.js
var wallElement = document.querySelector('.wall');
var windowElement = document.querySelector('.window');
var followerElement = document.getElementById('follower');

var offsetX = 0;
var offsetY = 0;
var initialX = 0;
var initialY = 0;
var velocityX = 0;
var velocityY = 0;
var gravity = 1;
var rotationAngle = 0;
var rotationSpeed = 0.05;
var isThrown = false;

function initializeWindow(followerCount) {
  windowElement.style.top = window.innerHeight - wallElement.offsetHeight + 'px';
  windowElement.style.left = 'calc(50% - var(--window-size))';
  velocityX = 0;
  velocityY = -2;
  rotationAngle = 0;
  isThrown = true;

  followerElement.textContent = followerCount + ' Follower';
}

windowElement.addEventListener('mousedown', function(event) {
  offsetX = event.clientX - windowElement.offsetLeft;
  offsetY = event.clientY - windowElement.offsetTop;
  initialX = event.clientX;
  initialY = event.clientY;
  velocityX = 0;
  velocityY = 0;
  isThrown = false;
});

windowElement.addEventListener('mouseup', function(event) {
  velocityX = (event.clientX - initialX) * 0.05;
  velocityY = (event.clientY - initialY) * 0.05;
  isThrown = true;
});

windowElement.addEventListener('mousemove', function(event) {
  if (!isThrown) {
    windowElement.style.left = event.clientX - offsetX + 'px';
    windowElement.style.top = event.clientY - offsetY + 'px';
  }
});

function applyGravity() {
  if (isThrown) {
    velocityY += gravity;
    windowElement.style.top = parseFloat(windowElement.style.top) + velocityY + 'px';
    windowElement.style.left = parseFloat(windowElement.style.left) + velocityX + 'px';

    var windowBottom = parseFloat(windowElement.style.top) + windowElement.offsetHeight;
    var windowHeight = window.innerHeight;
    var windowRight = parseFloat(windowElement.style.left) + windowElement.offsetWidth;
    var windowWidth = window.innerWidth;

    if (windowBottom >= windowHeight) {
      velocityY *= -0.6;
      windowElement.style.top = windowHeight - windowElement.offsetHeight + 'px';
    }

    if (windowRight >= windowWidth || parseFloat(windowElement.style.left) <= 0) {
      velocityX *= -0.6;
      windowElement.style.left = parseFloat(windowElement.style.left) < 0 ? '0px' : windowWidth - windowElement.offsetWidth + 'px';
    }

    if (parseFloat(windowElement.style.top) <= wallElement.offsetHeight) {
      velocityY = Math.abs(velocityY) * 0.6;
      windowElement.style.top = wallElement.offsetHeight + 'px';
    }

    var worldCenterX = windowWidth / 2;
    var offsetXFromCenter = parseFloat(windowElement.style.left) + windowElement.offsetWidth / 2 - worldCenterX;
    rotationAngle = Math.atan(offsetXFromCenter / (windowHeight - parseFloat(windowElement.style.top))) * (180 / Math.PI);
    windowElement.style.transform = 'rotate(' + rotationAngle + 'deg)';
  }

  if (Math.abs(velocityX) > 0.01) {
    velocityX *= 0.99;
  }

  requestAnimationFrame(applyGravity);
}

function getTwitchFollowerCount() {
  const clientID = 'h6r5jk1n6e4grllpgs77hj1ufs6sqp';
  const streamerUsername = 'filow';

  async function getFollowerCount() {
    try {
      const response = await fetch(`/followerCount?clientID=${clientID}&streamerUsername=${streamerUsername}`);
      const { followerCount } = await response.json();
      initializeWindow(followerCount);
    } catch (error) {
      console.log('Error occurred while retrieving the follower count:', error);
    }
  }

  getFollowerCount();
}

getTwitchFollowerCount();
applyGravity();
