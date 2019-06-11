import { InfoSecModule } from "./Module";
import { BrokerInterface, Observer } from "../broker-interface/broker-interface";
import { ServiceIndex } from "./service-index";

export class InfoSecNode implements Observer {

    module: InfoSecModule
    brokerInterface: BrokerInterface
    serviceLocator: ServiceIndex
    nodeId : string = Math.floor(Math.random() * 16777216).toString(16)

    static host : string = 'localhost'
    static port : number = 9001

    constructor(module: InfoSecModule) {

        this.module = module

        this.brokerInterface = new BrokerInterface(InfoSecNode.host,InfoSecNode.port,this.getNodeName())
        this.brokerInterface.addObserver(this)
        
        this.serviceLocator = new ServiceIndex([])
        
        this.initialize()        
    }

    getNodeName = () => {
        return this.module.name + "#" + this.nodeId
    }

    initialize = async () => {

        try {
            await this.brokerInterface.connect()
            await this.brokerInterface.publishMessage(`new/${this.nodeId}`, JSON.stringify(this.module.serviceIndex.getServicesForBroker()))
            await this.brokerInterface.subscribeToTopics(['services/+','new/+'])
            
            let promises : Promise<string>[] = []
            this.module.serviceIndex.getServices().forEach(service => promises.push(this.brokerInterface.subscribeToTopic(`service/${this.nodeId}/${service.serviceName}`)))
            
            await Promise.all(promises)

        }

        catch(e) {
            console.log(e)
        }

    }

    receiveMessage = (topic:string, message : Object) : void => {

        const topicLevels : string[] = topic.split('/')
        if(topicLevels[1] == this.nodeId)
            return

        console.log(`msg received on topic ${topic}`)
        console.log(message)

        console.log(topicLevels)
        
        if(topicLevels[0] == 'new') {
            this.onNewNode(message, topicLevels[1])
        }
        else if(topicLevels[0] == 'services') {
            this.addServicesOfNode(message, topicLevels[1])
        }
    }

    onNewNode = (message : Object, nodeId: string) => {

        this.brokerInterface.publishMessage(`services/${this.nodeId}`,JSON.stringify(this.module.serviceIndex.getServicesForBroker()))
        this.addServicesOfNode(message,nodeId)

    }

    addServicesOfNode = (message: any, nodeId: string) => {

        for(let i = 0; i < message.length; i++) {

            this.serviceLocator.addService({...message[i], provider: nodeId })

        }

        console.log('My Services')
        console.log(this.module.serviceIndex.getServices())
        console.log('Other Services')
        console.log(this.serviceLocator.getServices())


    }

}