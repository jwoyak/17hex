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
  
  // If we have full web share with file support (typically mobile devices)
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
  }
  // If we only have basic web share (URLs only - typical on desktop Chrome)
  else if (platform.hasBasicWebShare) {
    // For desktop browsers with partial Web Share support,
    // better to show the manual share dialog directly
    showShareOptions();
    
    // Alternate approach: could try sharing just a URL if appropriate
    // navigator.share({
    //   title: "Sigil: " + intent,
    //   text: "Check out this sigil I created",
    //   url: window.location.href
    // }).catch(() => showShareOptions());
  }
  // No Web Share support at all
  else {
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
  
  // Use different button text based on platform capabilities
  if (platform.hasFullWebShare) {
    mainShareButton.textContent = 'Share Sigil';
  } else {
    mainShareButton.textContent = 'Share & Export';
  }
  
  // Style the main button
  mainShareButton.style.display = 'block';
  mainShareButton.style.width = '100%';
  mainShareButton.style.padding = platform.isMobile ? '15px' : '10px';
  mainShareButton.style.marginBottom = '10px';
  mainShareButton.style.backgroundColor = '#4CAF50';
  mainShareButton.style.color = 'white';
  mainShareButton.style.border = 'none';
  mainShareButton.style.borderRadius = '4px';
  mainShareButton.style.fontSize = platform.isMobile ? '18px' : '16px';
  mainShareButton.style.fontWeight = 'bold';
  mainShareButton.style.cursor = 'pointer';
  mainShareButton.onclick = shareSigil;
  
  exportContainer.appendChild(mainShareButton);
  
  // Only show additional UI on desktop or if no full web share
  if (!platform.hasFullWebShare || !platform.isMobile) {
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
