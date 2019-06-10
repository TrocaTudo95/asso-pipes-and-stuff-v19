import * as Paho from './paho-mqtt-min'

console.log(Paho)

export class BrokerInterface {

    public pahoClient : Paho

    constructor(public host:string, public port:number, public path: string, clientId: string) {

        this.pahoClient = new Paho.Client(host,port,path,clientId)
        
        
    }

    connect = () : Promise<string> => {

        return new Promise((res,rej) => {

            this.pahoClient.connect({

                onSuccess: () => res('Connected To Broker'), 
                onFailure: () => rej('Failed connecting to Broker')

            })
        })
    }


    disconnect = () : void => {
        this.pahoClient.disconnect()
    }

    publishMessage = (topic:string, payload:string, qos:number = 0, retained: boolean = false) : void => {

        this.pahoClient.publish(topic,payload,qos,retained)

    }

    subscribeToTopic = (filter:string) : Promise<string> => {

        return new Promise((res,rej) => {

            this.pahoClient.subscribe(filter, {
                onSuccess: () => {
                    res(`Subscribed to Topic ${filter} `)
                },
                onFailure: () => {
                    rej(`Failed subscribed to Topic ${filter} `)
                }
            }) 

        })

        

    }


}