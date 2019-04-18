import {AsyncQueue} from '../queue/queue'

async function testAsyncQueueBehavior(nOps: number): Promise<Boolean> {
    const result = new Array<number>()
    const q = new AsyncQueue()

    const enqueue = (m: number) => q.push(m.toString())
    const dequeue = () => q.pop()
    const promises = Array<Promise<void>>()

    let enqueues = 0
    let dequeues = 0

    // Do a random permutation of enqueing and dequeing
    for (let i = 0; i < nOps; i += 1) {
        if (Math.random() > 0.5) {
            enqueues += 1
            enqueue(enqueues)
        } else {
            dequeues += 1
            promises.push(dequeue().then(v => { result.push(parseInt(v))}))
        }
    }

    const pending = Math.min(enqueues, dequeues)
    await Promise.all(promises.slice(0, pending))

    // Length should be equal minimum between enqueues and dequeues
    const isLengthOk = pending === result.length 

    // Messages should be ordered
    const isSorted = isArraySorted(result)

    return isLengthOk && isSorted
}

const isArraySorted = (a : Array<number>) : boolean =>  {

    for(let i= 0; i < a.length-1; i++) {
        if(a[i] > a[i+1])
            return false
    }

    return true

}

const test = async () => {

    try {
        let result = await testAsyncQueueBehavior(30)
        if(result == true)
            console.log("Tests have passed")
        else (
            console.error("Tests have failed")
        )
    } catch (e) {
        
    }

}

test()