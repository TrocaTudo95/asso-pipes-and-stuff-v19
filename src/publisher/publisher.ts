import { Queue } from "../queue/queue";
import { AsyncQueue } from "../queue/queue";
import { Broker } from "broker/broker";

export class Publisher {
    async push(queue: Queue, arg: string): Promise<void> {
        queue.push(arg)
    }
}

export class BrokerPublisher {
    
    queue :  AsyncQueue = new AsyncQueue()

    constructor(public name:string){}

    async push( arg: string): Promise<void> {
        this.queue.push(arg)
    }

    registerToBroker(broker: Broker) : void {
        broker.publishers.push(this)
    }

}
