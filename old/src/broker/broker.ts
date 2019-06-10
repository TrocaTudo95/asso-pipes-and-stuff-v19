import { BrokerSubscriberObserver, BrokerSubscriber } from "../subscriber/subscriber";
import { BrokerPublisher } from "../publisher/publisher";

export class Broker {
    
    public publishers: Array<BrokerPublisher> = new Array()
    public subscribers: Array<BrokerSubscriberObserver> = new Array()
    
    constructor(public name: string) { }

    async pull(publisher: BrokerPublisher): Promise<void> {
        publisher.queue.pop().then(res => {
            console.log(this.name + " " + res)
            this.subscribers.forEach(subscriber => subscriber.notify())
            this.push(res)
        })
    }

    push(message:string) : void {

        this.subscribers.forEach(subscriber => subscriber.queue.push(message))

    }
}