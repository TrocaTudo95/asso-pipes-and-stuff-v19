import { Queue } from "queue/queue";

 
 export class Subscriber {
    constructor(public name: string) { }

    async pull(queue: Queue): Promise<void> {
        queue.pop().then(res => console.log(this.name + " " + res))
    }
}


