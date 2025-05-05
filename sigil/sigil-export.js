// Function to handle platform detection for better sharing behavior
function detectPlatform() {
  const platform = {
    isMobile: false,
    isAndroid: false,
    isIOS: false,
    isWindows: false,
    isMac: false,
    isLinux: false,
    hasFullWebShare: false, // Can share files
    hasBasicWebShare: false, // Can only share URLs
  };
  
  // Detect mobile
  platform.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     ('ontouchstart' in window) || 
                     (navigator.maxTouchPoints > 0);
  
  // Detect specific platforms
  platform.isAndroid = /Android/i.test(navigator.userAgent);
  platform.isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  platform.isWindows = /Windows/.test(navigator.userAgent);
  platform.isMac = /Macintosh/.test(navigator.userAgent);
  platform.isLinux = /Linux/.test(navigator.userAgent) && !platform.isAndroid;
  
  // Detect Web Share API capabilities
  platform.hasBasicWebShare = !!navigator.share;
  
  // Test for file sharing support - need to check both navigator.share and navigator.canShare
  if (navigator.share && navigator.canShare) {
    // Create a test file object
    const testFile = new File(["test"], "test.txt", { type: "text/plain" });
    // Check if we can share this file
    platform.hasFullWebShare = navigator.canShare({ files: [testFile] });
  }
  
  // Chrome on Windows has Web Share API but usually can only share URLs, not files
  if (platform.isWindows && /Chrome/.test(navigator.userAgent) && !platform.isMobile) {
    platform.hasFullWebShare = false; // Force to false as Chrome on Windows typically doesn't support file sharing
  }
  
  // Save the platform info globally
  window.sigilPlatform = platform;
  console.log("Platform detection:", platform);
  
  return platform;
}

// Primary share function with improved platform handling
function shareSigil() {
  // Get or detect platform
  const platform = window.sigilPlatform || detectPlatform();
  var canvas = document.getElementById("canvas");
  var intent = document.getElementById("intent").value || "My Sigil";
  
  // FIXED: Force desktop browsers to always use the custom share dialog
  if (!platform.isMobile || platform.isWindows || platform.isMac || platform.isLinux) {
    // Skip the Web Share API entirely on desktop - always use our custom dialog
    showShareOptions();
    return;
  }
  
  // Continue with mobile sharing via Web Share API
  if (platform.hasFullWebShare) {
    canvas.toBlob(async function(blob) {
      try {
        // Create a file from the blob
        const file = new File([blob], "sigil.png", { type: "image/png" });
        
        const shareData = {
          title: "Sigil: " + intent,
          text: "Here's my sigil created with Sigil Creator",
          files: [file]
        };
        
        await navigator.share(shareData);
        showNotification("Shared successfully!");
        
      } catch (error) {
        // Don't show error for user cancellation
        if (error.name !== 'AbortError') {
          showNotification("Error sharing: " + error.message);
          showShareOptions(); // Show manual sharing options as fallback
        }
      }
    });
  } else {
    // Fall back to our custom share dialog
    showShareOptions();
  }
}

// Enhanced sharing options dialog with platform-specific options
function showShareOptions() {
  // Get platform
  const platform = window.sigilPlatform || detectPlatform();
  
  // Create a modal dialog for sharing options
  var modal = document.createElement('div');
  modal.className = 'sigil-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
  modal.style.zIndex = '1000';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  
  // Create modal content
  var modalContent = document.createElement('div');
  modalContent.style.backgroundColor = '#fff';
  modalContent.style.padding = '20px';
  modalContent.style.borderRadius = '5px';
  modalContent.style.maxWidth = '80%';
  modalContent.style.color = '#000';
  modalContent.style.maxHeight = '80vh';
  modalContent.style.overflow = 'auto';
  modalContent.style.position = 'relative';
  
  // Add heading
  var heading = document.createElement('h3');
  heading.textContent = 'Share Options';
  heading.style.marginTop = '0';
  modalContent.appendChild(heading);
  
  // Add close button
  var closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '10px';
  closeBtn.style.right = '10px';
  closeBtn.style.border = 'none';
  closeBtn.style.background = 'none';
  closeBtn.style.fontSize = '20px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.onclick = function() {
    document.body.removeChild(modal);
  };
  modalContent.appendChild(closeBtn);
  
  // Base share options always available
  var shareOptions = [
    { app: 'copy', label: 'Copy to Clipboard', action: function() { 
      copyToClipboard(); 
      document.body.removeChild(modal);
    }},
    { app: 'png', label: 'Save as PNG', action: function() { 
      exportSigil('png'); 
      document.body.removeChild(modal);
    }},
    { app: 'jpg', label: 'Save as JPEG', action: function() { 
      exportSigil('jpeg'); 
      document.body.removeChild(modal);
    }},
    { app: 'svg', label: 'Save as SVG', action: function() { 
      exportSigil('svg'); 
      document.body.removeChild(modal);
    }}
  ];
  
  // Add platform-specific options
  // Email option
  shareOptions.push({ 
    app: 'email', 
    label: 'Share via Email', 
    action: function() { 
      shareToApp('email'); 
      document.body.removeChild(modal);
    }
  });
  
  // Add note app options on desktop
  if (!platform.isMobile) {
    shareOptions.push(
      { app: 'notion', label: 'Share to Notion', action: function() { 
        shareToApp('notion'); 
        document.body.removeChild(modal);
      }},
      { app: 'evernote', label: 'Share to Evernote', action: function() { 
        shareToApp('evernote'); 
        document.body.removeChild(modal);
      }},
      { app: 'onenote', label: 'Share to OneNote', action: function() { 
        shareToApp('onenote');
        document.body.removeChild(modal);
      }}
    );
  }
  
  // Desktop-specific option
  if (platform.isWindows || platform.isMac || platform.isLinux) {
    shareOptions.push({
      app: 'embed', 
      label: 'Get Embed Code', 
      action: function() { 
        getEmbedCode(); 
        document.body.removeChild(modal);
      }
    });
  }
  
  // Create option grid
  var optionsContainer = document.createElement('div');
  
  // Use different layouts for mobile vs desktop
  if (platform.isMobile) {
    // Vertical list for mobile
    optionsContainer.style.display = 'flex';
    optionsContainer.style.flexDirection = 'column';
    optionsContainer.style.gap = '10px';
  } else {
    // Grid for desktop
    optionsContainer.style.display = 'grid';
    optionsContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))';
    optionsContainer.style.gap = '10px';
  }
  
  optionsContainer.style.marginTop = '20px';
  
  // Create buttons with appropriate styling for each platform
  shareOptions.forEach(function(option) {
    var btn = document.createElement('button');
    btn.textContent = option.label;
    
    if (platform.isMobile) {
      // Mobile-friendly button styling
      btn.style.padding = '15px 10px';
      btn.style.fontSize = '16px';
      btn.style.borderRadius = '5px';
      btn.style.border = '1px solid #ddd';
      btn.style.backgroundColor = '#f8f8f8';
    } else {
      // Desktop button styling
      btn.style.padding = '10px';
      btn.style.borderRadius = '3px';
      btn.style.border = '1px solid #ccc';
      btn.style.backgroundColor = '#f0f0f0';
    }
    
    btn.style.cursor = 'pointer';
    btn.onclick = option.action;
    optionsContainer.appendChild(btn);
  });
  
  modalContent.appendChild(optionsContainer);
  
  // Add current device information
  var deviceInfo = document.createElement('p');
  deviceInfo.style.marginTop = '20px';
  deviceInfo.style.fontSize = '12px';
  deviceInfo.style.color = '#666';
  deviceInfo.style.borderTop = '1px solid #eee';
  deviceInfo.style.paddingTop = '10px';
  
  if (platform.isMobile) {
    const deviceType = platform.isAndroid ? 'Android' : platform.isIOS ? 'iOS' : 'Mobile';
    deviceInfo.textContent = `You're using a ${deviceType} device`;
  } else {
    const osType = platform.isWindows ? 'Windows' : platform.isMac ? 'Mac' : 'Linux';
    deviceInfo.textContent = `You're using ${osType} on desktop`;
  }
  
  modalContent.appendChild(deviceInfo);
  
  // Add modal to page
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Add event listener to close when clicking outside
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

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

// Share to specific apps (fallback method)
function shareToApp(app) {
  var canvas = document.getElementById("canvas");
  var dataUrl = canvas.toDataURL('image/png');
  var intent = document.getElementById("intent").value || "My Sigil";
  
  switch(app) {
    case 'notion':
      // Generate a Notion URL with the image
      window.open(`https://www.notion.so/new-page?title=${encodeURIComponent(intent)}`);
      showNotification("For full Notion integration, set up API access in settings!");
      copyToClipboard(); // Auto-copy the image for convenience
      break;
    case 'evernote':
      // Evernote has a Web Clipper API
      window.open(`https://www.evernote.com/clip.action?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(intent)}`);
      copyToClipboard(); // Auto-copy the image for convenience
      break;
    case 'onenote':
      // Microsoft OneNote
      window.open(`https://www.onenote.com/api/v1.0/pages?title=${encodeURIComponent(intent)}`);
      showNotification("For full OneNote integration, set up API access in settings!");
      copyToClipboard(); // Auto-copy the image for convenience
      break;
    case 'email':
      // Mailto link with data URL (works for small images)
      var mailtoLink = `mailto:?subject=${encodeURIComponent("Sigil: " + intent)}&body=${encodeURIComponent("Here's my sigil: ")}`;
      window.open(mailtoLink);
      showNotification("Please paste the copied image into your email!");
      copyToClipboard(); // Auto-copy the image for convenience
      break;
  }
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

// Update the addExportUI function to adapt based on platform
function addExportUI() {
  // Detect platform first
  const platform = detectPlatform();
  
  // Create export container
  var exportContainer = document.createElement('div');
  exportContainer.id = 'exportOptions';
  exportContainer.style.margin = '10px';
  exportContainer.style.padding = '10px';
  exportContainer.style.backgroundColor = '#777';
  exportContainer.style.borderRadius = '4px';
  
  // Create the main share button with appropriate text
  var mainShareButton = document.createElement('button');
  
  // Use different button text based on platform
  if (platform.isMobile && platform.hasFullWebShare) {
    mainShareButton.textContent = 'Share Sigil';
  } else {
    mainShareButton.textContent = 'Share & Export';
  }
  
  // UPDATED: Style the main button with less distracting colors
  // Use the same dark gray as the app background with a green border/accent
  mainShareButton.style.display = 'block';
  mainShareButton.style.width = '100%';
  mainShareButton.style.padding = platform.isMobile ? '15px' : '10px';
  mainShareButton.style.marginBottom = '10px';
  mainShareButton.style.backgroundColor = '#555'; // Darker gray, similar to app theme
  mainShareButton.style.color = 'white';
  mainShareButton.style.border = '2px solid #4CAF50'; // Green border
  mainShareButton.style.borderRadius = '4px';
  mainShareButton.style.fontSize = platform.isMobile ? '18px' : '16px';
  mainShareButton.style.fontWeight = 'bold';
  mainShareButton.style.cursor = 'pointer';
  mainShareButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
  mainShareButton.style.position = 'relative';
  
  // Add a subtle green left border accent
  var accentDiv = document.createElement('div');
  accentDiv.style.position = 'absolute';
  accentDiv.style.left = '0';
  accentDiv.style.top = '0';
  accentDiv.style.bottom = '0';
  accentDiv.style.width = '5px';
  accentDiv.style.backgroundColor = '#4CAF50';
  accentDiv.style.borderTopLeftRadius = '2px';
  accentDiv.style.borderBottomLeftRadius = '2px';
  mainShareButton.appendChild(accentDiv);
  
  // Add hover effect
  mainShareButton.onmouseover = function() {
    this.style.backgroundColor = '#666';
  };
  mainShareButton.onmouseout = function() {
    this.style.backgroundColor = '#555';
  };
  
  mainShareButton.onclick = shareSigil;
  
  exportContainer.appendChild(mainShareButton);
  
  // Always show download options (not just on desktop)
  // since we want consistent UI and we're fixing the Windows issue
  
  // Export heading
  var exportHeading = document.createElement('div');
  exportHeading.innerHTML = '<strong>Download Options</strong>';
  exportHeading.style.marginBottom = '10px';
  exportContainer.appendChild(exportHeading);
  
  // Export buttons container
  var buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.flexWrap = 'wrap';
  buttonContainer.style.gap = '5px';
  exportContainer.appendChild(buttonContainer);
  
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
  
  // Only show embed button on desktop
  if (!platform.isMobile) {
    // Embed button
    var embedContainer = document.createElement('div');
    embedContainer.style.marginTop = '10px';
    exportContainer.appendChild(embedContainer);
    
    var embedHeading = document.createElement('div');
    embedHeading.innerHTML = '<strong>Integration</strong>';
    embedHeading.style.marginBottom = '5px';
    embedContainer.appendChild(embedHeading);
    
    var embedBtn = document.createElement('button');
    embedBtn.textContent = 'Get Embed Code';
    embedBtn.onclick = getEmbedCode;
    embedContainer.appendChild(embedBtn);
  }
  
  // Add to page - insert before the footer
  var sigilFooter = document.getElementById('sigilFooter');
  sigilFooter.parentNode.insertBefore(exportContainer, sigilFooter);
  
  // Add a small hint about the new features
  var hint = document.createElement('div');
  hint.textContent = 'New! You can now share and export your sigils.';
  hint.style.textAlign = 'center';
  hint.style.fontSize = '12px';
  hint.style.color = '#fff';
  hint.style.padding = '5px';
  hint.style.opacity = '0.8';
  
  // Add the hint to the app heading
  var appHeading = document.getElementById('appHeading');
  appHeading.appendChild(hint);
  
  // Fade out the hint after 10 seconds
  setTimeout(function() {
    hint.style.transition = 'opacity 1s ease';
    hint.style.opacity = '0';
  }, 10000);
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', function() {
  addExportUI();
});