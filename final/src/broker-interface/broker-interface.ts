import * as MQTT from './mqtt'

export interface Observer {
    receiveMessage(topic:string, message : Object) : void
}

interface Subject {
    notifyObservers(topic:string, msg: Object) : void
    observers : Observer []
    addObserver(observer:Observer) : number
    removeObserver(observer:Observer) : void
}

export class BrokerInterface implements Subject {

    public mqttClient : any
    public observers : Observer [] = []

    constructor(public host:string, public port:number, public clientId: string) {}

    connect = () : Promise<string> => {

        return new Promise((res,rej) => {

            try {

                this.mqttClient = MQTT.connect(`ws://${this.host}:${this.port}`,{clientId: this.clientId})
                this.mqttClient.on('connect', () => {

                    console.log(`${this.clientId} connected to Broker`)
                    this.mqttClient.on('message', this.onMessageReceived)
                    res(`${this.clientId} connected to Broker`)
    
                })
    
                this.mqttClient.on('error', () => {
    
                    console.log(`${this.clientId} failed trying conneting to Broker`)
                    rej(`${this.clientId} failed trying conneting to Broker`)
    
                })

                // this.mqttClient.on('disconnect', this.close)
                // this.mqttClient.on('offline', this.close)


            }

            catch(e) {
                console.log(e)
            }

        })
    }

    close = () : void => {

        console.log('closing connection')
        console.log(this.mqttClient.end())
    }

    publishMessage = (topic:string, message:string, qos:number = 0, retain: boolean = false) : Promise<string> => {

        console.log('publishing message')
        console.log(topic)

        return new Promise((res,rej) => {

            this.mqttClient.publish(topic,message,{qos:qos, retain: retain}, (err:any) => {
    
                if(err) {
                    rej(`Error Publishing Message: ${err}`)
                }
                else
                    res('Message Published')
    
            })

        })


    }

    subscribeToTopic = (topic:string) : Promise<string> => {

        return new Promise((res,rej) => {

            this.mqttClient.subscribe(topic, {}, (err:any,granted:any) => {
                
                if(granted)
                    res(`Subscribed to Topic ${topic}, with granted ${granted}`)
                else 
                    rej(`Failed subscribed to Topic ${topic} with error: ${err}`)
            }) 

        })

    }

    subscribeToTopics = (topics:string[]) : Promise<string> => {

        return new Promise((res,rej) => {

            this.mqttClient.subscribe(topics,{}, (err:any,granted:any) => {
                if(granted)
                    res(`Subscribed to Topics ${topics}, with granted ${granted}`)
                else
                    rej(`Failed subscribed to Topic ${topics} with error: ${err}`)
            }) 

        })

    }

    onMessageReceived = (topic: string, message: any, packet: any) : void => {

        const msgObject : Object = JSON.parse(new TextDecoder().decode(message))
        this.notifyObservers(topic,msgObject)

    }

    addObserver = (newObserver : Observer) : number => this.observers.push(newObserver)

    removeObserver = (observer : Observer) : void => {
        this.observers = this.observers.splice(this.observers.indexOf(observer))
    }
    
    notifyObservers = (topic:string,msg:Object) => this.observers.forEach(observer => observer.receiveMessage(topic,msg))

    

}