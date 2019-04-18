import { AsyncQueue } from "./queue/queue";
import { Publisher } from "./publisher/publisher";
import { Subscriber } from "./subscriber/subscriber";

async function scenario1() {   
    let queue = new AsyncQueue()
    let p1 = new Publisher()
    let s1 = new Subscriber('subscriber_1')
    s1.pull(queue)
    p1.push(queue, 'message')
}

scenario1();