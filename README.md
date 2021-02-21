## IP Pruebas: 181.29.14.209

# 1 Error Reiniciado > try catch block o .catch(() => reject())
```
(node:241374) UnhandledPromiseRejectionWarning: Error: Protocol error (Runtime.callFunctionOn): Execution context was destroyed.
    at Promise (/home/dgonzalez/Repositories/gambling/scrapper1/node_modules/puppeteer/lib/cjs/puppeteer/common/Connection.js:208:63)
    at new Promise (<anonymous>)
    at CDPSession.send (/home/dgonzalez/Repositories/gambling/scrapper1/node_modules/puppeteer/lib/cjs/puppeteer/common/Connection.js:207:16)
    at ExecutionContext._evaluateInternal (/home/dgonzalez/Repositories/gambling/scrapper1/node_modules/puppeteer/lib/cjs/puppeteer/common/ExecutionContext.js:201:50)
    at ExecutionContext.evaluate (/home/dgonzalez/Repositories/gambling/scrapper1/node_modules/puppeteer/lib/cjs/puppeteer/common/ExecutionContext.js:107:27)
    at DOMWorld.evaluate (/home/dgonzalez/Repositories/gambling/scrapper1/node_modules/puppeteer/lib/cjs/puppeteer/common/DOMWorld.js:91:24)
(node:241374) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 1)
(node:241374) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
```