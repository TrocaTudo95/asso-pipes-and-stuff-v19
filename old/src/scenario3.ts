import { AsyncQueue } from "./queue/queue";
import { Publisher } from "./publisher/publisher";
import { Subscriber } from "./subscriber/subscriber";
import { Ventilator } from "./ventilator/ventilator";


async function scenario3() {   
    let queue = new AsyncQueue()
    let p1 = new Publisher()
    let v1 = new Ventilator("ventilator")
    let s1 = new Subscriber('subscriber_1')
    let s2 = new Subscriber('subscriber_2')
    let s3 = new Subscriber('subscriber_3')
    s1.subscribe(v1)
    s2.subscribe(v1)
    s3.subscribe(v1)
    v1.pull(queue)
    v1.pull(queue)
    v1.pull(queue)
    p1.push(queue, 'message1')
    p1.push(queue, 'message2')
    p1.push(queue, 'message3')
}

scenario3();