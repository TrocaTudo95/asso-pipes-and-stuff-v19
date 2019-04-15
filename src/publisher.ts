class Publisher {
    async push(queue: Queue, arg: string): Promise<void> {
        queue.push(arg);
    }
}
