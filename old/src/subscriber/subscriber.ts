import { Queue, AsyncQueue } from "../queue/queue";
import { Broker } from "../broker/broker";
import { Ventilator } from "../ventilator/ventilator";

export interface Observer {
    notify(message: string) : void
    subscribe(ventilator: Ventilator) : void
} 

export interface BrokerSubscriberObserver {
    notify() : void
    subscribe(broker: Broker) : void
    queue : AsyncQueue
}

 export class Subscriber implements Observer {
    
    constructor(public name: string) { }

    async pull(queue: Queue): Promise<void> {
        queue.pop().then(res => console.log(this.name + " " + res))
    }

    notify(message:string) : void {

        console.log(`Subscriber ${this.name} : ${message}`)

    }

    subscribe(ventilator:Ventilator) : void {
        ventilator.subscribers.push(this)
    }

}

export class BrokerSubscriber implements BrokerSubscriberObserver {
    
    queue : AsyncQueue = new AsyncQueue()

    constructor(public name: string) { }

    async pull(): Promise<void> {
        this.queue.pop().then(res => console.log(this.name + " " + res)).catch(err => console.log("err"))
    }

    notify() : void {

        this.pull()

    }

    subscribe(broker: Broker) {

        broker.subscribers.push(this)

    }

}


