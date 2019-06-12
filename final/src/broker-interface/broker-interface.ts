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
                    rej(`Failed subscribing to Topic ${topic} with error: ${err}`)
            }) 

        })

    }

    subscribeToTopics = (topics:string[]) : Promise<string> => {

        return new Promise((res,rej) => {

            this.mqttClient.subscribe(topics,{}, (err:any,granted:any) => {
                if(granted)
                    res(`Subscribed to Topics ${topics}, with granted ${granted}`)
                else
                    rej(`Failed subscribing to Topics ${topics} with error: ${err}`)
            }) 

        })

    }

    unSubscribeToTopic = (topic:string) : Promise<string> => {

        return new Promise((res,rej) => {

            this.mqttClient.unsubscribe(topic, {}, (err:any) => {
                
                if(err)
                    rej(`Failed unsubscribing to Topic ${topic} with error: ${err}`)
                    
                else 
                    res(`Unsubscribed to Topic ${topic}`)
            }) 

        })

    }

    unSubscribeToTopics = (topics:string[]) : Promise<string> => {

        return new Promise((res,rej) => {

            this.mqttClient.unsubscribe(topics,{}, (err:any) => {
                if(err)
                    rej(`Failed unsubscribing to Topics ${topics} with error: ${err}`)
                else
                    res(`Unsubscribed to Topics ${topics}`)
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

/**
 * Class to be used to send a request, attaching a handler to call when receive a message to the reply topic (looks like XMLHTTPRequest)
 * This way we adapt a publish/subscribe pattern to a request/reply pattern for the cases a response tracking is needed
 */

class MQTTRequestService implements Observer {

    brokerInterface : BrokerInterface
    requestTopic: string
    replyTopic: string
    reply: Object
    onReceiveMessage : Function

    constructor(brokerInterface:BrokerInterface, requestTopic : string, replyTopic: string) {

        this.brokerInterface = brokerInterface
        this.requestTopic = requestTopic
        this.replyTopic = replyTopic
        this.brokerInterface.addObserver(this)

    }

    request = (message: string) : Promise<[string,string]>  => {

        return Promise.all([this.brokerInterface.publishMessage(this.requestTopic, message),  this.brokerInterface.subscribeToTopic(this.replyTopic)])

    }


    receiveMessage = (topic:string, message : Object) : void => {

        if(topic != this.replyTopic)
            return
        
        this.reply = message
        this.brokerInterface.unSubscribeToTopic(this.replyTopic)
        this.brokerInterface.removeObserver(this)
        this.onReceiveMessage(this.reply)

    }

    setOnReceiveMessageHandler = (handler : Function) : void => {

        this.onReceiveMessage = handler

    }

}

/**
 * Wrapper function that retrieves a promise of service reply (looks like http fetch)
 * 
 * 
 * @param brokerInterface broker interface 
 * @param requestTopic topic to publish request (/service and  takes node id, service name and request number)
 * @param replyTopic topic to receive the request (/serviceReply and takes the node id, service name and request number)
 * @param message message to send
 */

export const fetchMQTT = (brokerInterface : BrokerInterface, requestTopic: string, replyTopic: string, message: string) => {

    return new Promise((resolve,reject) => {
        
        const mqttRequest = new MQTTRequestService(brokerInterface,requestTopic,replyTopic)
        mqttRequest.request(message).then(_ => {

            mqttRequest.setOnReceiveMessageHandler((message:Object) => {

                resolve(message)
    
            })

        })
        
        .catch(error => reject(error))
        
    })

}