async function init() {
    console.log("DOOT init")
    await browser.storage.local.clear()
    await browser.storage.local.set({
        doot: "HMM"
    })
    console.log("DOOT finished setting storage")
}

init()
.then(() => {
    console.log("DOOT done init")
})

