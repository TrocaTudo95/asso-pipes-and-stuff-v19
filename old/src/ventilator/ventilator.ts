import { Queue } from "../queue/queue";
import { Observer } from "../subscriber/subscriber";

 
 export class Ventilator {
    
    public subscribers: Array<Observer> = new Array()
    
    constructor(public name: string) { }

    async pull(queue: Queue): Promise<void> {
        queue.pop().then(res => {
            console.log(this.name + " " + res)
            this.subscribers.forEach(observer => observer.notify(res))
        })
    }
}