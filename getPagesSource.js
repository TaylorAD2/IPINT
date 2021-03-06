/** IPINT v1.0
    ORIGINAL DOMtoString CODE AUTHOR:
    @author Rob W <http://stackoverflow.com/users/938089/rob-w>
    Demo: var serialized_html = DOMtoString(document);
    New IPINT Overlay AUTHOR
    @author Jacob Kelley / exaybachay 

*** Step 1
**********
*   Read the current window into memory to review and use for updating window
*/
function DOMtoString(document_root) {
    var html = '',
        node = document_root.firstChild;
    while (node) {
        switch (node.nodeType) {
        case Node.ELEMENT_NODE:
            html += node.outerHTML;
            break;
        case Node.TEXT_NODE:
            html += node.nodeValue;
            break;
        case Node.CDATA_SECTION_NODE:
            html += '<![CDATA[' + node.nodeValue + ']]>';
            break;
        case Node.COMMENT_NODE:
            html += '<!--' + node.nodeValue + '-->';
            break;
        case Node.DOCUMENT_TYPE_NODE:
            // (X)HTML documents are identified by public identifiers
            html += "<!DOCTYPE " + node.name + (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '') + (!node.publicId && node.systemId ? ' SYSTEM' : '') + (node.systemId ? ' "' + node.systemId + '"' : '') + '>\n';
            break;
        }
        node = node.nextSibling;
    }

    /** Step 2
    **********
    *   Use data from current browser webpage to find IP addresses and investigate them
    *
    *   Step 2a
    *   Set up regex pattern and apply it against the current webpage, storing results in myArray 
    */
    var re = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}/g;
    var myArray = html.match(re);
    //reduce the array and dedupe it
    var myArray = myArray.sort().filter(function(el,i,a){return i==a.indexOf(el);})

    /** Step 2b
    *   Inject breaks into DOM of IP addresses 
    */
    var newArray = myArray.join("\n");
    

    /** Step 3
    **********
    *   Make sidebar to control opening and closing OSINT frames
    */
    //make DOM elements to bind array to
    var newArrayDiv = document.createElement("div");
    var bgImage = chrome.extension.getURL("images/1.jpg");
    newArrayDiv.id = "newArrayDiv";
    newArrayDiv.style.cssText = 'z-index\:120000111;position\:fixed;top\:10px;left\:10px;height\:755px;width\:175px;padding-top\:25px;padding-left\:10px;color\:white;background-color\:transparent;border-radius\:6px;border\:3px solid gray;background-image\:url(' + bgImage + ');box-shadow\:1px 1px 0\.5px #555555;font-family\:Arial;font-size\:12px;-webkit-font-smoothing\:antialiased;line-height\:17px';
    document.body.appendChild(newArrayDiv);

    //add attributes to window for closing and background config
    var closeButton = document.createElement("div");
    var buttonImage = chrome.extension.getURL("images/r1.png");
    closeButton.id = "closeButton";
    closeButton.style.cssText = 'cursor\:pointer;z-index\:120000000;position\:fixed;top\:10px;left\:10px;max-height\:25%;max-width\:25%;background-image\:url(' + buttonImage + ')';
    var buttonImg = document.createElement("img");
    buttonImg.style.cssText = 'z-index\:120000002;position\:fixed;top\:15px;left\:15px;max-height\:2%;max-width\:2%';
    buttonImg.id = "buttonImage";
    buttonImg.src = buttonImage;
    
    //Set function to close out sidebar and all divs
    $(buttonImg).click(function() {
        $('.windows').each(function() {
            $(this).remove();
        });

        $('.toggleDiv').each(function() {
            $(this).remove();
        });

        $('#newArrayDiv').remove();
    });

    //attach close button to DOM
    document.getElementById("newArrayDiv").appendChild(closeButton);
    document.getElementById("closeButton").appendChild(buttonImg);
    
    //use IP array to generate text of IP addresses and add it to sidebar div
    for (i = 0;i < myArray.length; i++) {
        var aipdbIframeName = "aipdbIframe" + i;

        var newArrayText = document.createElement("p");
        var newArrayTextName = "newArrayText" + i;
        newArrayText.id = newArrayTextName;
        newArrayText.innerText += myArray[i];
        newArrayText.className = "IPAddy";
        newArrayText.value += myArray[i];
        newArrayText.className = "toggleme";
        newArrayText.style.cssText = 'background-color\:transparent;cursor\:pointer';
        document.getElementById("newArrayDiv").appendChild(newArrayText);
    }

    /*** Step 4 
    ***********
    *   Create and arm events to unhide OSINT iframes for analysis
    */
    $( ".toggleme" ).each(function(index) {
        $(this).on("click", function(){
            //un-set other elements
            $('.toggleme').css('border-bottom', '0px solid white');
            $('.toggleme').css('text-shadow', '0 0 0 #fff, 0 0 0 #fff, 0 0 0 #fff');

            //set the active IP's color for reference
            $(this).css('border-bottom', '1px solid white');
            $(this).css('text-shadow', '0 0 0.25em #f00, 0 0 0.25em #f00, 0 0 0.25em #f00');
            
            //set up handles to access iframes and toggle divs to modify them
            var tmIframeNameToggle = "tmIframe" + index;
            var tmToggleNameToggle = "tmToggleDiv" + index;
            var tcIframeNameToggle = "tcIframe" + index;
            var tcToggleNameToggle = "tcToggleDiv" + index;
            var aipdbIframeNameToggle = "aipdbIframe" + index;
            var aipdbToggleNameToggle = "aipdbToggleDiv" + index;
            var rtIframeNameToggle = "rtIframe" + index;
            var rtToggleNameToggle = "rtToggleDiv" + index;
            //attach handles to DOM, making elements visible
            var tmHandle = document.getElementById(tmIframeNameToggle);
            var tmToggleHandle = document.getElementById(tmToggleNameToggle);
            var tcHandle = document.getElementById(tcIframeNameToggle);
            var tcToggleHandle = document.getElementById(tcToggleNameToggle);
            var aipdbHandle = document.getElementById(aipdbIframeNameToggle);
            var aipdbToggleHandle = document.getElementById(aipdbToggleNameToggle);
            var rtHandle = document.getElementById(rtIframeNameToggle);
            var rtToggleHandle = document.getElementById(rtToggleNameToggle);
            //initialize virustotal and alienvault URLs for window loading
            var virusTotal = "https\://www\.virustotal\.com/en/ip-address/" + myArray[index] + "/information/";
            var alienvault = "https\://otx\.alienvault\.com/browse/pulses/?q=" + myArray[index] + "";
            
            //if topbar is loaded already, tear it down and close things out
            if ( $(tmToggleHandle).css('display') === ('unset') ){
                
                $('.windows').each(function() {
                    $(this).css('display', 'none');
                });

                $('.toggleDiv').each(function() {
                    $(this).css('display', 'none');
                    $(this).css('z-index', '0')
                });
            }
            //if toolbar hasn't loaded yet, unhide the topnav for loading OSINT iframes and also pop out a virustotal window since you can't load VT in an iframe
            else {            
                window.open(virusTotal, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,top=75,left=1425,width=483,height=860");
                window.open(alienvault, "_blank", "toolbar=no,scrollbars=yes,resizable=yes,top=75,left=933,width=483,height=860");

                //hide all iframes and divs before loading the new batch, to avoid a user clicking one ip and then another without first toggling/closing the initial IP
                $('.windows').each(function() {
                    $(this).remove();
                });

                $('.toggleDiv').remove()

                var bgImage = chrome.extension.getURL("images/1.jpg");
                var tm = "https\://www\.threatminer\.org/host\.php?q=" + myArray[index];

                //set threatminer iframe
                var tmIframeName = "tmIframe";
                var tmWindow = document.createElement('iframe');
                tmWindow.id = tmIframeName;
                tmWindow.value = tmIframeName;
                tmWindow.style.cssText = 'display\:none;position\:fixed;top\:55px;left\:205px;height\:730px;width\:85%;color\:white;background\:#666;display\:none;overflow\:scroll;z-index\:0;border-radius\:6px;border\:2px solid gray;box-shadow\:5px 5px 2\.5px #555555;';
                tmWindow.className = 'windows';
                tmWindow.src = tm;
                //attach the iframe to the webpage
                document.body.appendChild(tmWindow);
                document.getElementById(tmIframeName).name = tmIframeName;

                //$(tmHandle).css('z-index', '120000000');
                //$(tmHandle).css('display', 'unset');
                $(tmWindow).css('z-index', '120000000');
                $(tmWindow).css('display', 'unset');

                //set threatminer toggle div
                var tmToggleDiv = document.createElement('div');
                var tmToggleDivName = "tmToggleDiv";
                var tmToggleDivText = document.createElement('p');
                tmToggleDiv.id = tmToggleDivName;
                tmToggleDiv.Name = tmToggleDivName;
                tmToggleDiv.value = tmToggleDivName;
                tmToggleDiv.style.cssText = 'text-shadow\: 0 0 0.25em #f00, 0 0 0.25em #f00, 0 0 0.25em #f00;cursor\:pointer;display\:unset;position\:fixed;top\:6px;left\:200px;height\:39px;width\:100px;color\:white;z-index\:120000111;background-color\:transparent;background-image\:url(' + bgImage + ');margin\:5;padding-left\:10px;padding-right\:10px;border-top-left-radius\:6px;border-bottom-left-radius\:6px;border\:2px solid gray;box-shadow\:5px 5px 2\.5px #555555;font-family\:Arial;font-size\:12px;-webkit-font-smoothing\:antialiased;line-height\:17px';
                tmToggleDiv.className = 'toggleDiv';
                //set the text to append to this div
                tmToggleDivText.innerText += "ThreatMiner";
                //attach the DIV to the webpage
                document.body.appendChild(tmToggleDiv);
                document.getElementById(tmToggleDivName).appendChild(tmToggleDivText);

                //set robtex toggle div
                var rtToggleDiv = document.createElement('div');
                var rtToggleDivName = "rtToggleDiv";
                var rtToggleDivText = document.createElement('p');
                rtToggleDiv.id = rtToggleDivName;
                rtToggleDiv.Name = rtToggleDivName;
                rtToggleDiv.value = rtToggleDivName;
                rtToggleDiv.style.cssText = 'cursor\:pointer;display\:unset;position\:fixed;top\:6px;left\:300px;height\:39px;width\:100px;color\:white;;z-index\:120000111;background-color\:transparent;background-image\:url(' + bgImage + ');margin\:5;padding-left\:10px;padding-right\:10px;border-top-right-radius\:6px;border-bottom-right-radius\:6px;border\:2px solid gray;box-shadow\:5px 5px 2\.5px #555555;font-family\:Arial;font-size\:12px;-webkit-font-smoothing\:antialiased;line-height\:17px';
                rtToggleDiv.className = 'toggleDiv';
                //set the text to append to this div
                rtToggleDivText.innerText += "robtex";
                //attach the DIV to the webpage
                document.body.appendChild(rtToggleDiv);
                document.getElementById(rtToggleDivName).appendChild(rtToggleDivText);

                //set abuseipdb toggle div
                var aipdbToggleDiv = document.createElement('div');
                var aipdbToggleDivName = "aipdbToggleDiv";
                var aipdbToggleDivText = document.createElement('p');
                aipdbToggleDiv.id = aipdbToggleDivName;
                aipdbToggleDiv.Name = aipdbToggleDivName;
                aipdbToggleDiv.style.cssText = 'cursor\:pointer;display\:unset;position\:fixed;top\:6px;left\:400px;height\:39px;width\:100px;color\:white;z-index\:120000115;background-color\:transparent;border-radius\:6;background-image\:url(' + bgImage + ');margin\:5;padding-left\:10px;padding-right\:10px;border-top-right-radius\:6px;border-bottom-right-radius\:6px;border\:2px solid gray;box-shadow\:5px 5px 2\.5px #555555;font-family\:Arial;font-size\:12px;-webkit-font-smoothing\:antialiased;line-height\:17px';
                aipdbToggleDiv.className = 'toggleDiv';
                //set the text to append to this div
                aipdbToggleDivText.innerText += "AbuseIPDB";
                //attach the DIV to the webpage
                document.body.appendChild(aipdbToggleDiv);
                document.getElementById(aipdbToggleDivName).appendChild(aipdbToggleDivText);

                //set threatcrowd toggle div
                var tcToggleDiv = document.createElement('div');
                var tcToggleDivName = "tcToggleDiv";
                var tcToggleDivText = document.createElement('p');
                tcToggleDiv.id = tcToggleDivName;
                tcToggleDiv.Name = tcToggleDivName;
                tcToggleDiv.value = tcToggleDivName;
                tcToggleDiv.style.cssText = 'cursor\:pointer;display\:unset;position\:fixed;top\:6px;left\:500px;height\:39px;width\:100px;color\:white;z-index\:120000116;background-color\:transparent;border-bottom-right-radius\:6px;border-top-right-radius\:6px;background-image\:url(' + bgImage + ');margin\:5;padding-left\:10px;padding-right\:10px;border\:2px solid gray;box-shadow\:5px 5px 2\.5px #555555;font-family\:Arial;font-size\:12px;-webkit-font-smoothing\:antialiased;line-height\:17px';
                tcToggleDiv.className = 'toggleDiv';
                //set the text to append to this div
                tcToggleDivText.innerText += "ThreatCrowd";
                //attach the DIV to the webpage
                document.body.appendChild(tcToggleDiv);
                document.getElementById(tcToggleDivName).appendChild(tcToggleDivText);

                //unhide OSINT service toggle divs
                $('.windows').each(function() {
                    $(tmHandle).css('display', 'unset');
                    $(tmHandle).css('z-index', '120000111');

                    $('.toggleDiv').each(function() {
                        $(this).css('display', 'unset');
                        $(this).css('z-index', '120000001');
                        $(this).css('cursor', 'pointer');
                    });
                });

                //if user clicks on the ThreatMiner div, hide all other iframes and display the TM OSINT
                $('#tmToggleDiv').on("click", function() {
                    var tm = "https\://www\.threatminer\.org/host\.php?q=" + myArray[index];

                    //set threatminer iframe
                    var tmIframeName = "tmIframe" + index;
                    var tmWindow = document.createElement('iframe');
                    tmWindow.id = tmIframeName;
                    tmWindow.value = tmIframeName;
                    tmWindow.style.cssText = 'display\:none;position\:fixed;top\:55px;left\:205px;height\:730px;width\:85%;color\:white;background\:#666;display\:none;overflow\:scroll;z-index\:0;border-radius\:6px;border\:2px solid gray;box-shadow\:5px 5px 2\.5px #555555;';
                    tmWindow.className = 'windows';
                    tmWindow.src = tm;

                    //add TM iframe to document to make it visible
                    document.body.appendChild(tmWindow);
                    document.getElementById(tmIframeName).name = tmIframeName;

                    //hide all windows before showing TM window
                    $('.windows').each(function() {
                        $(this).css('z-index', '0');
                        $(this).css('display', 'none');
                    });

                    //turn off red text glow before setting it on TM div                    
                    $('.toggleDiv').each(function() {
                        $(this).css('text-shadow', 'none');
                    });

                    //show TM window and set text to glowing red
                    $(tmWindow).css('z-index', '120000000');
                    $(tmWindow).css('display', 'unset');
                    $(this).css('text-shadow', '0 0 0.25em #f00, 0 0 0.25em #f00, 0 0 0.25em #f00');
                });

                //if user clicks on the Robtex div, hide all other iframes and display the robtex OSINT        
                $('#rtToggleDiv').on("click", function() {
                    var rt = "https\://www\.robtex\.com/?dns=" + myArray[index];

                    //set robtex iframe
                    var rtIframeName = "rtIframe" + index;
                    var rtWindow = document.createElement('iframe');
                    rtWindow.id = rtIframeName;
                    rtWindow.value = rtIframeName;
                    rtWindow.style.cssText = 'display\:none;position\:fixed;top\:55px;left\:205px;height\:730px;width\:85%;color\:white;background\:#666;display\:none;overflow\:scroll;z-index\:0;border-radius\:6px;border\:2px solid gray;box-shadow\:5px 5px 2\.5px #555555;';
                    rtWindow.className = 'windows';
                    rtWindow.src = rt;

                    //add TM iframe to document to make it visible
                    document.body.appendChild(rtWindow);
                    document.getElementById(rtIframeName).name = rtIframeName;

                    //hide all windows before showing RT window
                    $('.windows').each(function() {
                        $(this).css('z-index', '0');
                        $(this).css('display', 'none');
                    });

                    //turn off red text glow before setting it on RT div                                        
                    $('.toggleDiv').each(function() {
                        $(this).css('text-shadow', 'none');
                    });

                    //show RT window and set text to glowing red
                    $(rtWindow).css('z-index', '120000000');
                    $(rtWindow).css('display', 'unset');
                    $(this).css('text-shadow', '0 0 0.25em #f00, 0 0 0.25em #f00, 0 0 0.25em #f00');
                });

                //if user clicks on the AbuseIPDB div, hide all other iframes and display the AIPDB OSINT
                $('#aipdbToggleDiv').on("click", function() {
                    var abuseipdb = "https\://www\.abuseipdb\.com/check/" + myArray[index];

                    //set abuseipdb iframe
                    var aipdbIframeName = "aipdbIframe" + index;
                    var aipdbWindow = document.createElement('iframe');
                    aipdbWindow.id = aipdbIframeName;
                    aipdbWindow.value = aipdbIframeName;
                    aipdbWindow.style.cssText = 'display\:none;position\:fixed;top\:55px;left\:205px;height\:730px;width\:85%;color\:white;background\:#666;overflow\:scroll;z-index\:0;border-radius\:6px;border\:2px solid gray;box-shadow\:5px 5px 2\.5px #555555;';
                    aipdbWindow.className = 'windows';
                    aipdbWindow.src = abuseipdb;

                    //add AIPDB iframe to document to make it visible
                    document.body.appendChild(aipdbWindow);
                    document.getElementById(aipdbIframeName).name = aipdbIframeName;

                    //hide all windows before showing AIPDB window
                    $('.windows').each(function() {
                        $(this).css('z-index', '0');
                        $(this).css('display', 'none');
                    });

                    //turn off red text glow before setting it on RT div
                    $('.toggleDiv').each(function() {
                        $(this).css('text-shadow', 'none');
                    });

                    //show AIPDB window and set text to glowing red
                    $(aipdbWindow).css('z-index', '120000004');
                    $(aipdbWindow).css('display', 'unset');
                    $(this).css('text-shadow', '0 0 0.25em #f00, 0 0 0.25em #f00, 0 0 0.25em #f00');
                });

                //if user clicks on the ThreatCrowd div, hide all other iframes and display the TC OSINT        
                $('#tcToggleDiv').on("click", function() {
                    var tc = "https\://www\.threatcrowd\.org/ip\.php?ip=" + myArray[index];

                    //set threatcrowd iframe
                    var tcIframeName = "tcIframe" + index;
                    var tcWindow = document.createElement('iframe');
                    tcWindow.id = tcIframeName;
                    tcWindow.value = tcIframeName;
                    tcWindow.style.cssText = 'display\:none;position\:fixed;top\:55px;left\:205px;height\:730px;width\:85%;color\:white;background\:#666;overflow\:scroll;z-index\:0;border-radius\:6px;border\:2px solid gray;box-shadow\:5px 5px 2\.5px #555555;';
                    tcWindow.className = 'windows';
                    tcWindow.src = tc;

                    //add TC iframe to document to make it visible
                    document.body.appendChild(tcWindow);
                    document.getElementById(tcIframeName).name = tcIframeName;

                    //hide all windows before showing TC window
                    $('.windows').each(function() {
                        $(this).css('z-index', '0');
                        $(this).css('display', 'none');
                    });    

                    //turn off red text glow before setting it on TC div
                    $('.toggleDiv').each(function() {
                        $(this).css('text-shadow', 'none');
                    });

                    //show TC window and set text to glowing red
                    $(tcWindow).css('z-index', '120000005');
                    $(tcWindow).css('display', 'unset');
                    $(this).css('text-shadow', '0 0 0.25em #f00, 0 0 0.25em #f00, 0 0 0.25em #f00');
                });
        };
    return newArray;
    });

});

}
chrome.runtime.sendMessage({
    action: "getSource",
    source: DOMtoString(document)
});
