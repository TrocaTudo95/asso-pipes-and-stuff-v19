import { Queue } from "queue/queue";

export class Publisher {
    async push(queue: Queue, arg: string): Promise<void> {
        queue.push(arg);
    }
}
