var dexy = (function () {
  let openPromise = null
  let openRequest = null
  const osName = "store"
  const keyName = "key"
  let isClosing = false
  let isClosed = false

  return function (name) {
    openPromise = new Promise((resolve, reject) => {
      openRequest = indexedDB.open(name, 1)
      openRequest.onerror = reject
      openRequest.onsuccess = resolve
      openRequest.onupgradeneeded = event => event.target.result.createObjectStore(osName, { keyPath: keyName })
    })

    return { get, set, del, close }
  }

  function get(key) {
    if (isClosed) return Promise.reject('db is closed')
    return new Promise((resolve, reject) => {
      openPromise.then(() => {
        const db = openRequest.result
        const tx = db.transaction([osName], "readwrite")
        const store = tx.objectStore([osName])
        const request = store.get(key)

        request.onerror = reject
        request.onsuccess = event => resolve((event.target.result || {}).value)
      }).catch(reject)
    })
  }

  function set(key, value) {
    if (isClosed) return Promise.reject('db is closed')
    return new Promise((resolve, reject) => {
      openPromise.then(() => {
        const db = openRequest.result
        const tx = db.transaction([osName], "readwrite")
        const store = tx.objectStore([osName])
        const request = store.put({ key, value })

        request.onerror = reject
        request.onsuccess = resolve
      }).catch(reject)
    })
  }

  function del(key) {
    if (isClosed) return Promise.reject('db is closed')
    return new Promise((resolve, reject) => {
      openPromise.then(() => {
        const db = openRequest.result
        const tx = db.transaction([osName], "readwrite")
        const store = tx.objectStore([osName])
        const request = store.delete(key)

        request.onerror = reject
        request.onsuccess = resolve
      }).catch(reject)
    })
  }

  function close() {
    if (isClosed) return Promise.reject('db is closed')
    isClosed = true
    return new Promise((resolve, reject) => {
      openPromise.then(() => {
        const db = openRequest.result
        db.close()
        resolve()
      }).catch(reject)
    })
  }

}())
