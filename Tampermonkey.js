// ==UserScript==
// @name         Broadcom Account Verification Is Pending Fix
// @version      2026-08-09
// @description  This modifies an XHR response to remove the "Account verification is Pending. Please try after some time." message and allow downloading free software.
// @author       An-m1654
// @match        *://support.broadcom.com/group/ecx/productfiles*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=broadcom.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    if (/&freeDownloads=true/.test(window.location)) {
        const originalXHRSend = window.XMLHttpRequest.prototype.send;
        window.XMLHttpRequest.prototype.send = function() {
            const originalOnReadyStateChange = this.onreadystatechange;
            this.onreadystatechange = function() {
                if (this.readyState == 4 && this.responseURL == "https://support.broadcom.com/group/ecx/productfiles/-/productFiles/getDownloadableFiles?pageNumber=0&pageSize=50") {
                    const originalResponse = JSON.parse(this.responseText);
                    for (const [i, item] of originalResponse.data.packlistDetails.content.entries()) {
                        for (const [j, file] of item.fileDetails.entries()) {
                            if ("exportControlStatus" in file) {
                                originalResponse.data.packlistDetails.content[i].fileDetails[j].exportControlStatus = "SCREENING_NOT_REQUIRED";
                            }
                        }
                    }
                    Object.defineProperty(this, 'responseText', {
                        value: JSON.stringify(originalResponse),
                        writable: false
                    });
                }
                return originalOnReadyStateChange.apply(this, arguments);
            };
            return originalXHRSend.apply(this, arguments);
        };
    }
})();
