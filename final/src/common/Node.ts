import { InfoSecModule } from "./Module";
import { BrokerInterface, Observer, fetchMQTT } from "../broker-interface/broker-interface";
import { ServiceIndex, ServiceRequest, ServiceReply } from "./service-index";

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
                this.module.serviceIndex.getServices().forEach(service => promises.push(this.brokerInterface.subscribeToTopic(`service/${this.nodeId}/${service.serviceName}/+`)))
            
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

            const result = this.module.executeService(message.serviceRequest)
            const serviceReply = {
                serviceName: message.serviceRequest.serviceName,
                result: result
            }

            this.brokerInterface.publishMessage(`serviceReply/${topicLevels[1]}/${message.serviceRequest.serviceName}/${topicLevels[3]}`,JSON.stringify({serviceReply: serviceReply}))

        }

    }

    onNewNode = (message : Object, nodeId: string) => {

        this.brokerInterface.publishMessage(`services/${this.nodeId}`,JSON.stringify(this.module.serviceIndex.getServicesForBroker()))
        this.addServicesOfNode(message,nodeId)

        /**
         * testing only
         */

        if(this.module.name == 'ArithmeticLogicModule') {
         
            Promise.all([this.requestService(this.serviceLocator.getServicesForBroker()[0].serviceName, ['lower']), this.requestService(this.serviceLocator.getServicesForBroker()[0].serviceName, ['João Pedro'])])
    
               .then(result => {
    
                   console.log(result)
    
               })
               .catch(e => console.log(e))
        
        }

        else if (this.module.name == 'ConversionModule') {

            Promise.all([this.requestService(this.serviceLocator.getServicesForBroker()[0].serviceName, [1,2,3]), this.requestService(this.serviceLocator.getServicesForBroker()[0].serviceName, [5])])
    
               .then(result => {
    
                   console.log(result)
    
               })
               .catch(e => console.log(e))

        }
         
    }

    addServicesOfNode = (message: any, nodeId: string) => {

        for(let i = 0; i < message.length; i++) {

            this.serviceLocator.addService({...message[i], provider: nodeId })

        }

    }

    requestService = async (serviceName: string, params: any[]) : Promise<ServiceReply> => {

        let remoteService = this.serviceLocator.findService(serviceName)

        return new Promise((res,rej) => {

            if(remoteService != undefined) {

                let serviceRequest : ServiceRequest = {
                    serviceName: remoteService.serviceName,
                    params: params,
                    
    
                }
    
                try {
    
                    const requestId = `${this.nodeId}REQ${InfoSecNode.requestNumber++}`
                    const requestTopic = `service/${remoteService.provider}/${remoteService.serviceName}/${requestId}`
                    const message = JSON.stringify({serviceRequest: serviceRequest})
                    const replyTopic = `serviceReply/${remoteService.provider}/${remoteService.serviceName}/${requestId}`
    
                    fetchMQTT(this.brokerInterface,requestTopic,replyTopic,message).then(reply => {

                        let replyObject : any = reply as any

                        res(replyObject.serviceReply)

                    })
                    .catch((error) => rej(error))
    
                }
    
                catch(e) {
                    console.log(e)
                }
    
    
            }
    
            else {
                res({serviceName:'',result:''})
            }

        })

        

    }

}