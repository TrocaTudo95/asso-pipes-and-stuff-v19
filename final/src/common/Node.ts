import { InfoSecModule } from "./Module";
import { BrokerInterface, Observer } from "../broker-interface/broker-interface";
import { ServiceIndex, ServiceRequest } from "./service-index";

export class InfoSecNode implements Observer {

    module: InfoSecModule
    brokerInterface: BrokerInterface
    serviceLocator: ServiceIndex
    nodeId : string = Math.floor(Math.random() * 16777216).toString(16)

    requestQueue : ServiceRequest[] = []

    static host : string = 'localhost'
    static port : number = 9001
    static requestNumber = 0

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

    receiveMessage = (topic:string, message : any) : void => {

        const topicLevels : string[] = topic.split('/')
        
        if(topicLevels[1] == this.nodeId && topicLevels[0] != 'service')
            return
        
        console.log(`msg received on topic ${topic}`)
        
        if(topicLevels[0] == 'new') {
            this.onNewNode(message, topicLevels[1])
        }
        else if(topicLevels[0] == 'services') {
            this.addServicesOfNode(message, topicLevels[1])
        }

        else if(topicLevels[0] == 'service') {

            this.module.executeService(message.serviceRequest)

        }

    }

    onNewNode = (message : Object, nodeId: string) => {

        this.brokerInterface.publishMessage(`services/${this.nodeId}`,JSON.stringify(this.module.serviceIndex.getServicesForBroker()))
        this.addServicesOfNode(message,nodeId)

        /**
         * testing only
         */

         

         if(this.module.name == 'ArithmeticLogicModule')
            this.requestService(this.serviceLocator.getServicesForBroker()[0].serviceName, ['lower'] )

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

    requestService = async (serviceName: string, params: any[]) => {

        let remoteService = this.serviceLocator.findService(serviceName)

        if(remoteService != undefined) {

            let serviceRequest : ServiceRequest = {
                serviceName: remoteService.serviceName,
                params: params,
                requestId: `${this.nodeId}#${InfoSecNode.requestNumber++}`

            }

            try {

                await this.brokerInterface.publishMessage(`service/${remoteService.provider}/${remoteService.serviceName}`, JSON.stringify({serviceRequest: serviceRequest}))
            }

            catch(e) {
                console.log(e)
            }


        }

        else {

        }

    }

}