async function scenario1() {   
    let queue = new AsyncQueue()
    let p1 = new Publisher()
    let s1 = new Subscriber('subscriber_1')
    s1.pull(queue)
    p1.push(queue, 'ola')
}