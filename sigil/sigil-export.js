// Function to handle exporting the sigil canvas to different formats
function exportSigil(format) {
    var canvas = document.getElementById("canvas");
    var link = document.createElement('a');
    var filename = "sigil-" + Date.now();
    var intent = document.getElementById("intent").value;
    
    // If there's intent text, use a cleaned version of it for the filename
    if (intent && intent.trim() !== "") {
      // Remove vowels and spaces, keep only first 20 chars to maintain sigil privacy
      var cleanIntent = intent.replace(/[aeiou\s]/ig, '').substr(0, 20);
      filename = "sigil-" + cleanIntent;
    }
    
    switch(format) {
      case 'png':
        link.download = filename + '.png';
        link.href = canvas.toDataURL('image/png');
        break;
      case 'jpeg':
        link.download = filename + '.jpg';
        link.href = canvas.toDataURL('image/jpeg', 0.8);
        break;
      case 'svg':
        // For SVG, we need to create an SVG representation of the canvas
        var svgData = canvasToSVG(canvas);
        var svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
        link.href = URL.createObjectURL(svgBlob);
        link.download = filename + '.svg';
        break;
    }
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  // Convert canvas to SVG
  function canvasToSVG(canvas) {
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    
    // Get background color
    var bgColor = document.getElementById("sigilBgColor").value;
    
    // Start SVG
    var svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="${bgColor}"/>`;
    
    // We can't perfectly translate canvas to SVG, but we can
    // capture the image data as a base64 image inside the SVG
    var imageData = canvas.toDataURL('image/png');
    svg += `<image width="${width}" height="${height}" href="${imageData}"/>`;
    
    // Close SVG
    svg += `</svg>`;
    
    return svg;
  }
  
  // Copy canvas to clipboard
  function copyToClipboard() {
    var canvas = document.getElementById("canvas");
    
    // Create a temporary canvas to handle the copy
    canvas.toBlob(function(blob) {
      // Use the Clipboard API if available
      if (navigator.clipboard && navigator.clipboard.write) {
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]).then(
          () => showNotification("Sigil copied to clipboard!"),
          (error) => showNotification("Could not copy: " + error)
        );
      } else {
        // Fallback for browsers that don't support Clipboard API
        try {
          // Create a temporary image element
          const img = document.createElement('img');
          img.src = canvas.toDataURL('image/png');
          
          // Create a contenteditable div to handle the copy
          const div = document.createElement('div');
          div.contentEditable = true;
          div.style.position = 'absolute';
          div.style.opacity = 0;
          
          // Add the image to the div and select it
          document.body.appendChild(div);
          div.appendChild(img);
          
          // Select the div content and copy
          const range = document.createRange();
          range.selectNode(div);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          document.execCommand('copy');
          
          // Clean up
          document.body.removeChild(div);
          showNotification("Sigil copied to clipboard!");
        } catch (err) {
          showNotification("Could not copy: " + err);
        }
      }
    });
  }
  
  // Share to note apps
  function shareToApp(app) {
    var canvas = document.getElementById("canvas");
    var dataUrl = canvas.toDataURL('image/png');
    var intent = document.getElementById("intent").value || "My Sigil";
    
    switch(app) {
      case 'notion':
        // Generate a Notion URL with the image
        // Since this requires Notion API integration, this is just a placeholder
        window.open(`https://www.notion.so/new-page?title=${encodeURIComponent(intent)}`);
        showNotification("For full Notion integration, set up API access in the settings!");
        break;
      case 'evernote':
        // Evernote has a Web Clipper API
        window.open(`https://www.evernote.com/clip.action?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(intent)}`);
        break;
      case 'onenote':
        // Microsoft OneNote
        window.open(`https://www.onenote.com/api/v1.0/pages?title=${encodeURIComponent(intent)}`);
        showNotification("For full OneNote integration, set up API access in the settings!");
        break;
      case 'email':
        // Mailto link with data URL (works for small images)
        var mailtoLink = `mailto:?subject=${encodeURIComponent("Sigil: " + intent)}&body=${encodeURIComponent("Here's my sigil: ")}`;
        window.open(mailtoLink);
        showNotification("Please paste the copied image into your email!");
        // Auto-copy the image for convenience
        copyToClipboard();
        break;
    }
  }
  
  // Show a notification to the user
  function showNotification(message) {
    var notification = document.createElement('div');
    notification.className = 'sigil-notification';
    notification.textContent = message;
    
    // Style the notification
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = '#333';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(function() {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s ease';
      setTimeout(function() {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  }
  
  // Function to prepare for API/embed functionality
  function getEmbedCode() {
    var embedCode = `<iframe src="https://yourdomain.com/sigil/embed?intent=${encodeURIComponent(document.getElementById('intent').value)}" width="450" height="500" frameborder="0"></iframe>`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(embedCode).then(
      function() {
        showNotification("Embed code copied to clipboard!");
      }, 
      function() {
        showNotification("Could not copy embed code");
      }
    );
  }
  
  // Add the new UI elements to the page
  function addExportUI() {
    // Create export container
    var exportContainer = document.createElement('div');
    exportContainer.id = 'exportOptions';
    exportContainer.style.margin = '10px';
    exportContainer.style.padding = '10px';
    exportContainer.style.backgroundColor = '#777';
    exportContainer.style.borderRadius = '4px';
    
    // Export heading
    var exportHeading = document.createElement('div');
    exportHeading.innerHTML = '<strong>Export & Share Options</strong>';
    exportHeading.style.marginBottom = '10px';
    
    // Export buttons container
    var buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexWrap = 'wrap';
    buttonContainer.style.gap = '5px';
    
    // Export format buttons
    var exportFormats = [
      { format: 'png', label: 'PNG' },
      { format: 'jpeg', label: 'JPEG' },
      { format: 'svg', label: 'SVG' }
    ];
    
    exportFormats.forEach(function(item) {
      var btn = document.createElement('button');
      btn.textContent = item.label;
      btn.onclick = function() { exportSigil(item.format); };
      buttonContainer.appendChild(btn);
    });
    
    // Add copy button
    var copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy';
    copyBtn.onclick = copyToClipboard;
    buttonContainer.appendChild(copyBtn);
    
    // Share buttons container
    var shareContainer = document.createElement('div');
    shareContainer.style.marginTop = '10px';
    
    var shareHeading = document.createElement('div');
    shareHeading.innerHTML = '<strong>Share to:</strong>';
    shareHeading.style.marginBottom = '5px';
    
    var shareButtonContainer = document.createElement('div');
    shareButtonContainer.style.display = 'flex';
    shareButtonContainer.style.flexWrap = 'wrap';
    shareButtonContainer.style.gap = '5px';
    
    // Share app buttons
    var shareApps = [
      { app: 'notion', label: 'Notion' },
      { app: 'evernote', label: 'Evernote' },
      { app: 'onenote', label: 'OneNote' },
      { app: 'email', label: 'Email' }
    ];
    
    shareApps.forEach(function(item) {
      var btn = document.createElement('button');
      btn.textContent = item.label;
      btn.onclick = function() { shareToApp(item.app); };
      shareButtonContainer.appendChild(btn);
    });
    
    // Embed button (for future functionality)
    var embedBtn = document.createElement('button');
    embedBtn.textContent = 'Get Embed Code';
    embedBtn.onclick = getEmbedCode;
    embedBtn.style.marginTop = '10px';
    
    // Assemble the UI
    shareContainer.appendChild(shareHeading);
    shareContainer.appendChild(shareButtonContainer);
    
    exportContainer.appendChild(exportHeading);
    exportContainer.appendChild(buttonContainer);
    exportContainer.appendChild(shareContainer);
    exportContainer.appendChild(embedBtn);
    
    // Add to page - insert before the footer
    var sigilFooter = document.getElementById('sigilFooter');
    sigilFooter.parentNode.insertBefore(exportContainer, sigilFooter);
  }
  
  // Call this function when the page loads
  document.addEventListener('DOMContentLoaded', function() {
    addExportUI();
  });