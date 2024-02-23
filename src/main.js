
const popup = document.createElement('div');
popup.id = 'custom-popup';
popup.style.display = 'none';
let globalZoomLevel = 2; // Starting zoom level
document.body.appendChild(popup);

// ========================================================================================
// ========================================================================================


// Position the popup based on mouse position
function positionPopup(event) {
    const offsetX = -155; // Offset to move the popup to the left of the cursor
    const offsetY = -155; // Offset to move the popup above the cursor
    popup.style.left = `${event.clientX + offsetX}px`; // Adjust left position
    popup.style.top = `${event.clientY + offsetY}px`; // Adjust top position
}



function getCanvasElementForZoom(canvas, leftPercent, topPercent, zoomFactor, canvasWidth, canvasHeight) {
    const zoomCanvasSize = 150;
    const sourceCaptureSize = zoomCanvasSize / zoomFactor;

    // Adjust sourceX and sourceY to prevent negative values and ensure they stay within canvas bounds
    let sourceX = (leftPercent * canvasWidth) - (sourceCaptureSize / 2);
    let sourceY = (topPercent * canvasHeight) - (sourceCaptureSize / 2);

    const zoomCanvas = document.createElement('canvas');
    zoomCanvas.width = zoomCanvasSize;
    zoomCanvas.height = zoomCanvasSize;
    const ctx = zoomCanvas.getContext('2d');

    // Draw the zoomed-in portion
    ctx.drawImage(canvas, sourceX, sourceY, sourceCaptureSize, sourceCaptureSize, 0, 0, zoomCanvasSize, zoomCanvasSize);

    // Optional: Draw a visual guide in the zoom canvas
    drawCenterCircle(ctx, zoomCanvasSize);

    return zoomCanvas;
}


function drawCenterCircle(ctx, zoomCanvasSize) {
    // Drawing a circle at the center of the zoom canvas as a visual guide
    const centerX = (zoomCanvasSize / 2) - 1;
    const centerY = (zoomCanvasSize / 2);
    const radius = 4; // Circle radius

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0,0,0,0.0)'; // Circle color
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.50)'; // Circle border color
    ctx.stroke();
}


// Function to add event listeners to the target element
const addTargetChartElementListeners = (targetChartElement) => {
    let canvasChartElement = null;
    // Check if an SVG element is in targetChartElement.children
    for (let i = 0; i < targetChartElement.children.length; i++) {
        const child = targetChartElement.children[i];
        if (canvasChartElement) {
            break; // Break the loop if both elements are found
        } else if (child.tagName.toLowerCase() === 'canvas') {
            canvasChartElement = child;
        }
    }

    if (!canvasChartElement) {
        console.error('No CANVAS element found in targetChartElement');
        return;
    }

    targetChartElement.addEventListener('mouseenter', function (event) {
        globalZoomLevel = 2; // Starting zoom level
        popup.style.display = 'block';
        positionPopup(event, popup);
    });

    targetChartElement.addEventListener('wheel', function (event) {
        const target = event.target;

        if (!event.target || !event.target.classList) {
            return;
        }

        const delta = event.deltaY || event.detail || event.wheelDelta;

        if (delta > 0) {
            globalZoomLevel *= 0.9; // Decrease zoom level on scroll down
        } else {
            globalZoomLevel *= 1.1; // Increase zoom level on scroll up
        }

        globalZoomLevel = Math.min(Math.max(globalZoomLevel, 2), 10);

        if (target.classList.contains('sc-easbae') && target.classList.contains('gyuNyl') || target.closest('.sc-easbae.gyuNyl')) {
            popup.style.display = 'block';
            positionPopup(event);

            // Get the percentage position from the SVG
            const positionSvg = [...targetChartElement.children].pop();
            const leftPercent = parseFloat(positionSvg.style.left) / 100; // Convert percentage to a decimal
            const topPercent = parseFloat(positionSvg.style.top) / 100; // Convert percentage to a decimal

            const zoomLevel = globalZoomLevel;
            const canvasWidth = canvasChartElement.width;
            const canvasHeight = canvasChartElement.height;

            const canvasChart = getCanvasElementForZoom(canvasChartElement, leftPercent, topPercent, zoomLevel, canvasWidth, canvasHeight);
            popup.innerHTML = '';
            popup.appendChild(canvasChart);

            popup.style.display = 'block';
            positionPopup(event, popup);
        } else {
            popup.style.display = 'none';
        }
    });




    document.addEventListener('mousemove', function (event) {
        const target = event.target;

        if (!event.target || !event.target.classList) {
            return;
        }

        if (target.classList.contains('sc-easbae') && target.classList.contains('gyuNyl') || target.closest('.sc-easbae.gyuNyl')) {
            popup.style.display = 'block';
            positionPopup(event);

            // Get the percentage position from the SVG
            const positionSvg = [...targetChartElement.children].pop();
            const leftPercent = parseFloat(positionSvg.style.left) / 100; // Convert percentage to a decimal
            const topPercent = parseFloat(positionSvg.style.top) / 100; // Convert percentage to a decimal

            const zoomLevel = globalZoomLevel;
            const canvasWidth = canvasChartElement.width;
            const canvasHeight = canvasChartElement.height;

            const canvasChart = getCanvasElementForZoom(canvasChartElement, leftPercent, topPercent, zoomLevel, canvasWidth, canvasHeight);
            popup.innerHTML = '';
            popup.appendChild(canvasChart);

            popup.style.display = 'block';
            positionPopup(event, popup);
        } else {
            popup.style.display = 'none';
        }
    });

    targetChartElement.addEventListener('mouseleave', function () {
        popup.style.display = 'none';
    });
};


const canvasWrapperSellector = '.sc-easbae.gyuNyl'

// Use a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (!mutation.addedNodes) return;

        for (let i = 0; i < mutation.addedNodes.length; i++) {
            // Check if the added node is the targetChartElement or contains it
            const node = mutation.addedNodes[i];
            const targetChartElement = node.nodeType === 1 && node.matches(canvasWrapperSellector) ? node : node.querySelector ? node.querySelector(canvasWrapperSellector) : null;

            if (targetChartElement) {
                addTargetChartElementListeners(targetChartElement);
                observer.disconnect(); // Stop observing once we've found our target element
                return; // Exit the loop and function since the target is found
            }
        }
    });
});

// Configuration of the observer:
const config = { childList: true, subtree: true };

// Start observing the body for added nodes
observer.observe(document.body, config);
