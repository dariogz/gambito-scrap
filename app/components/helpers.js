export default {
  sleep: (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  timeoutPromise: (ms, promise) => {
    // Create a promise that rejects in <ms> milliseconds
    let timeout = new Promise((resolve, reject) => {
      let id = setTimeout(() => {
        clearTimeout(id);
        reject('Timed out in '+ ms + 'ms.')
      }, ms)
    })

    // Returns a race between our timeout and the passed in promise
    return Promise.race([
      promise,
      timeout
    ])
  }
}