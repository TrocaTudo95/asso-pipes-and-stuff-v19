export abstract class Queue{
    abstract push(arg: string): void
    abstract pop(): Promise<string>
}

export class AsyncQueue extends Queue {
    public queue: Array<string> = new Array()
    protected promises: Array<any> = new Array()

    async push(arg: string): Promise<void> {
        if (this.promises.length > 0)
            this.promises.shift()(arg)
        else
            this.queue.push(arg)
    }

    async pop(): Promise<string> {
        if (this.queue.length > 0)
            return Promise.resolve(this.queue.shift())
        else
            return new Promise(res => this.promises.push(res))
    }
}