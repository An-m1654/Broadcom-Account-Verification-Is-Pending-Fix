All text below is going to be a little bit casual so bear with me. You also should read the Tampermonkey.js script along with this.

All the stuff up 'till `const originalXHRSend = window.XMLHttpRequest.prototype.send;` is template that tampermonkey gives when creating a new script

const `originalXHRSend = window.XMLHttpRequest.prototype.send;` this saves the original send function of XMLHttpRequest into a variable. The prototype thing is just javascript's way providing instance functions/variable, whereas stuff without prototype would be static

then, I set the `window.XMLHttpRequest.prototype.send` to a a new function with `window.XMLHttpRequest.prototype.send = function() {`

this `const originalOnReadyStateChange = this.onreadystatechange;` like before saves the old onreadystatechange. But this is a instance method. prototype is not needed as it is gotten from `this.xxx`, and the keyword `this` is already tell you it's instance not static

again, this line ` this.onreadystatechange = function() {` sets the onreadystatechange function

`if (this.readyState == 4 && this.responseURL == "https://support.broadcom.com/group/ecx/productfiles/-/productFiles/getDownloadableFiles?pageNumber=0&pageSize=50") {` this basically does a check to see if the link is what I wanted, so I only do changes on what I need but not everything. (Because vmware doesn't just make 1 single xhr request)
this also checks readyState to be 4, which is the state of DONE, because xhr allows hanging and NOT DONE.

yet again saves the original with this line `const originalResponse = JSON.parse(this.responseText);`

now this whole part is just what I make after reading the response I got.
```js
                for (const [i, item] of originalResponse.data.packlistDetails.content.entries()) {
                    for (const [j, file] of item.fileDetails.entries()) {
                        if ("exportControlStatus" in file) {
                            originalResponse.data.packlistDetails.content[i].fileDetails[j].exportControlStatus = "SCREENING_NOT_REQUIRED";
                        }
                    }
                }
```
so all this is doing (this is the most crucial part actually) is reading the json that I saved in the originalResponse variable, and did a for loop for an array in that json, then another for loop for another array. This is just me reading the json I was given by VMWare. Then, the if checks if `exportControlStatus` is a thing (specifically, a key in that json object that I put in the file variable via the second for loop). If it exists, set the json variable originalResponse's path `data.packlistDetails.content[i]...` to SCREENING_NOT_REQUIRED. This value is what I got from another guy's github (specifically this guy: https://github.com/St7530/VMware-download-helper, but his repo and code is a bit messy and lack documentation which I wanted to make so I made this).

The reason I don't just set the file variable or set the item variable is because I'm worried those are instances and not references, so when I exit the for loop, those changes disappear. Thats why I set the originalResponse directly instead.

Also, the `for (const [x, y] of z.entries())` is the javascript way of iterating through the array of z and being able to get index and value. if I used a `for xxx in xxx` then I can only get the value, which again, I worried it is instance not reference so I did the .entries one to get the index. (I probably did something grammeratically wrong here lol)

this again is one whole part:
```js
                Object.defineProperty(this, 'responseText', {
                    value: JSON.stringify(originalResponse),
                    writable: false
                });
```
where I set the responseText variable from this to the string of that json.
Apparently this `Object.defineProperty` is needed and I can't just use `this.responseText = xxx` is because this.responseText doesn't have a setter, and apparently Javascript just gave us a way to override the whole variable

with the `Object.defineProperty` function

this line: `return originalOnReadyStateChange.apply(this, arguments);`
basically calls the `originalOnReadyStateChange` function (which I saved the onReadyStateChange before I made any edits), and now I ran that again to do what it was originally meant to do.

`arguments` is a thing that javascript gives to get all of the arguments in `window.XMLHttpRequest.prototype.send = function() {`

finally, this line does the same as the `return originalOnReadyStateChange.apply(this, arugments);` where it runs what it is supposed to run before I made changes
`return originalXHRSend.apply(this, arguments);`

and viola, that's all the lines explained.

If something doesn't make any sense then that's because I originally typed this in discord (because I wanted to explain this to my friends but they probably don't care anyways)
