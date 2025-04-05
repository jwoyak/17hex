function sigilize() {
    var canvas = document.getElementById("canvas");
    if (canvas.getContext) {
      
      // build the context of our canvas
      var ctx = canvas.getContext("2d");
      
      // set the dimension (it's a square so we use the same on x and y)
			var canvasDimension = 500;

      // get the input statement of intent
      var fullstr = document.getElementById("intent").value;
      
      // get rid of the vowels and spaces
			var nvstr = fullstr.replace(/[aeiou\s]/ig,'');
			
			// remove any duplicate characters so we end up with unique consonants
			var str = nvstr.split("").filter(function(x, n, s) { return s.indexOf(x) == n }).join("");
			
	    // Clear the canvas to start drawing with a clean slate (option to turn this off?)
			ctx.clearRect(0, 0, canvas.width, canvas.height);
	
      // *** PROCESS USER PREFERENCES ***
      // ********************************
	    // Set the letter case based on user input
      var letterCase = document.getElementById("letterCase").value;
			if (letterCase == 'upper') {
        str = str.toUpperCase();
      } else if (letterCase == 'lower') {
        str = str.toLowerCase();
      }
      
      // UNUSED Set the rotation style based on user input
      //var rotateStyle = document.getElementById("rotateStyle").value;

      // Set the rotation amount from the slider
      var rotateAmt = document.getElementById("rotateAmt").value;

      // Set the font based on user input
      var sigilFont = document.getElementById("sigilFont").value;
      var sFsize = document.getElementById("sigilFontSize").value;
			if (sigilFont == 'alemendra') {
        sFcode = sFsize+'px alemendraregular';
      } else if (sigilFont == 'waterst') {
        sFcode = sFsize+'px water_streetregular';
      } else if (sigilFont == 'xenophone') {
        sFcode = sFsize+'px xenophoneregular';
      } else if (sigilFont == 'znikomitno') {
        sFcode = sFsize+'px znikomitno24regular';
      } else if (sigilFont == 'annabel') {
        sFcode = sFsize+'px annabel_scriptregular';
      } else if (sigilFont == 'benegraphic') {
        sFcode = sFsize+'px benegraphicregular';
      } else if (sigilFont == 'bethluisnion') {
        sFcode = sFsize+'px beth-luis-nionregular';
      } else if (sigilFont == 'drummon') {
        sFcode = sFsize+'px drummonregular';
      } else if (sigilFont == 'telephasic') {
        sFcode = sFsize+'px telephasic_brknormal';
      } else if (sigilFont == 'univox') {
        sFcode = sFsize+'px univoxregular';
      } else if (sigilFont == 'aquilinetwo') {
        sFcode = sFsize+'px aquilinetworegular';
      } else if (sigilFont == 'leafyglade') {
        sFcode = sFsize+'px leafy_gladeregular';
      } else if (sigilFont == 'firstorder') {
        sFcode = sFsize+'px first_orderregular';
      } else if (sigilFont == 'lowdown') {
        sFcode = sFsize+'px lowdown_brknormal';
      } else if (sigilFont == 'elderfuthark') {
        sFcode = sFsize+'px elder_futharkregular';
      } else if (sigilFont == 'sgread') {
        sFcode = sFsize+'px sgreadregular';
      }

      
      // Set the color from the color chooser
      var sigilColor = document.getElementById('sigilColor').value;
      var sigilBgColor = document.getElementById("sigilBgColor").value;

      // DRAW THE BACKGROUND
      ctx.fillStyle = sigilBgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // *** DRAW THE SIGILIZED LETTERS AT THE TOP ***
      // *********************************************
			// Set the font size and face - ADD USER OPTIONS FOR THIS
      ctx.font = "14px serif";
      
      // Set the font color - ADD USER OPTIONS FOR THIS
      ctx.fillStyle = sigilColor;
      
      // Center the text.  Just leave this alone
      ctx.textAlign = "center";
      
      // Print the sigilized letters string at the top if box is checked
      if (document.getElementById("showSigilText").checked) {
	ctx.fillText("Sigilized letters: "+(str), 200,20);
      }
    
      // *** DRAW THE SIGIL ***
      // **********************

      // First define rotation counter outside the loop
      	var rotateStep = "10";

      // Start the for loop where we rotate the canvas and print each letter
        for (var x = 0; x < str.length; x++) {
          
          // Set our one-letter character variable to the current positoin in the string
          var c = str.charAt(x);
          
	  // Save the current context (current orientation, origin)
	  ctx.save();
						
          ctx.translate( canvas.width / 2, canvas.height / 2 );
	  
     	  // Check whether the Rotate Random box is checked
      	  // If it is not checked, set the rotation amount

	  if (document.getElementById("rotateRand").checked) {
    		//rotate by a random integer between 5 and 10 - seems to work best for sigils 
	  	ctx.rotate(Math.floor(Math.random() * ((10-5)+1) + 5));
 	  } else {
		rotateStep = (rotateStep * x);
		ctx.rotate(rotateAmt * x);
	  }

/*
	  if (rotateStyle == 'random') {
                // Rotate by pinching the center of the canvas

    		//rotate by a random integer between 5 and 10 - seems to work best for sigils 
	  	ctx.rotate(Math.floor(Math.random() * ((10-5)+1) + 5));
	  } else if (rotateStyle == 'stacked') {
		//ctx.rotate(1);
	  }
*/		
          // specify the font and colour of the text for each letter - USER OPTIONS HERE
          ctx.font = sFcode;
          ctx.fillStyle = sigilColor;

          // set alignment of text at writing point (left) - Leave this alone
          ctx.textAlign = "left";

          // write the text, checking to see if we should write it in uppercase, etc)
            ctx.fillText((c), 0,0);

          // now restore the canvas to default orientation
				  ctx.restore();
        }
    }
   
      

                
    // Setup the Destroy button to clear the canvas and start over
    document.getElementById('clear').addEventListener('click', function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      document.getElementById("intent").value="";
    }, false);
              
}