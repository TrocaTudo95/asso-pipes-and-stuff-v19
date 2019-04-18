import { BrokerPublisher } from "./publisher/publisher";
import { BrokerSubscriber } from "./subscriber/subscriber";
import { Broker } from "./broker/broker";


async function scenario4() {   

    let p1 = new BrokerPublisher("p1")
    let p2 = new BrokerPublisher("p2")
    let p3 = new BrokerPublisher("p3")
    let b1 = new Broker("broker")
    let s1 = new BrokerSubscriber('subscriber_1')
    let s2 = new BrokerSubscriber('subscriber_2')
    let s3 = new BrokerSubscriber('subscriber_3')
    
    p1.registerToBroker(b1)
    p2.registerToBroker(b1)
    p3.registerToBroker(b1)


    s1.subscribe(b1)
    s2.subscribe(b1)
    s3.subscribe(b1)

    b1.pull(p1)
    b1.pull(p1)
    b1.pull(p2)
    b1.pull(p3)

    p2.push('message2')
    p1.push('messagep11')
    p1.push('messagep12')
    p3.push( 'message3')


}

scenario4();