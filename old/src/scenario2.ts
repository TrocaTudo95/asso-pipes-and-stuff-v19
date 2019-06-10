import { AsyncQueue } from "./queue/queue";
import { Publisher } from "./publisher/publisher";
import { Subscriber } from "./subscriber/subscriber";


async function scenario2() {   
    let queue = new AsyncQueue()
    let p1 = new Publisher()
    let s1 = new Subscriber('subscriber_1')
    let s2 = new Subscriber('subscriber_2')
    let s3 = new Subscriber('subscriber_3')
    s1.pull(queue)
    s2.pull(queue)
    s3.pull(queue)
    p1.push(queue, 'message1')
    p1.push(queue, 'message2')
    p1.push(queue, 'message3')
}

scenario2();