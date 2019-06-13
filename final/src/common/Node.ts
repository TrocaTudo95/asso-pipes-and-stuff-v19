import { InfoSecModule } from "./Module";
import { BrokerInterface, Observer, fetchMQTT } from "../broker-interface/broker-interface";
import { ServiceIndex, ServiceRequest, ServiceReply } from "./service-index";
import * as joint from './joint-min'
import * as _ from 'lodash';
import * as backbone from 'backbone';

export class InfoSecNode implements Observer {
    
    static host : string = 'localhost'
    static port : number = 9001
    static requestNumber = 0
    
    module: InfoSecModule
    brokerInterface: BrokerInterface
    serviceLocator: ServiceIndex
    nodeId : string = Math.floor(Math.random() * 16777216).toString(16)
    ui : UI = new UI()
    knownNodes : string[] = [this.nodeId]
    observerId : number

    constructor(module: InfoSecModule) {

        this.module = module

        // window.addEventListener('beforeunload',this.leave)
        // window.addEventListener('close',this.leave)

        this.ui.setHandleClose(this.leave)

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
            await this.brokerInterface.subscribeToTopics(['services/+','new/+', 'leave/+'])
            
            let promises : Promise<string>[] = []
            this.module.serviceIndex.getServices().forEach(service => {
                
                promises.push(this.brokerInterface.subscribeToTopic(`service/${this.nodeId}/${service.serviceName}/+`))
                this.ui.addService(service.serviceName, this.nodeId)
                
            })
            
            await Promise.all(promises)

        }

        catch(e) {
            console.log(e)
        }

    }

    receiveMessage = (topic:string, message : any) : void => {

        const topicLevels : string[] = topic.split('/')

        if(this.knownNodes.includes(topicLevels[1]) && topicLevels[0] != 'service' && topicLevels[0] != 'leave')
            return
        
        console.log(`processing msg received on topic ${topic}`)

        if(topicLevels[0] == 'new') {
            this.onNewNode(message, topicLevels[1])
        }
        else if(topicLevels[0] == 'services') {
            this.addServicesOfNode(message, topicLevels[1])
        }

        else if(topicLevels[0] == 'leave') {
            this.removeServicesOfNode(topicLevels[1])
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

            // console.log('Arithmetic')
         
            // Promise.all([this.requestService(this.serviceLocator.getServicesForBroker()[0].serviceName, ['lower']), this.requestService(this.serviceLocator.getServicesForBroker()[0].serviceName, ['João Pedro'])])
    
            //    .then(result => {
            //         console.log('Remote Service')
            //         console.log(result)
    
            //    })
            //    .catch(e => console.log(e))

            // this.requestService(this.module.serviceIndex.getServices()[0].serviceName,[1,2,3,4])
            //    .then(result => {
            //         console.log('Local Service')
            //         console.log(result)
            //    })
        
        }

        else if (this.module.name == 'ConversionModule') {

            // Promise.all([this.requestService(this.serviceLocator.getServicesForBroker()[1].serviceName, [1,2,3]), this.requestService(this.serviceLocator.getServicesForBroker()[0].serviceName, [5])])
    
            //    .then(result => {
    
            //        console.log(result)
    
            //    })
            //    .catch(e => console.log(e))

        }
         
    }

    addServicesOfNode = (message: any, nodeId: string) => {

        for(let i = 0; i < message.length; i++) {

            this.serviceLocator.addService({...message[i], provider: nodeId })
            this.ui.addService(message[i].serviceName, nodeId)

        }

        this.knownNodes.push(nodeId)

    }

    removeServicesOfNode = (nodeId: string) => {

        this.serviceLocator.removeServicesFromNode(nodeId)
        this.ui.removeServicesFromNode(nodeId)
        this.knownNodes = this.knownNodes.filter(node => node != nodeId)

    }

    requestService = async (serviceName: string, params: any[]) : Promise<ServiceReply> => {

        return new Promise((res,rej) => {

            let remoteService = this.serviceLocator.findService(serviceName)
            let localService = this.module.serviceIndex.findService(serviceName)

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

                const result = this.module.executeService({serviceName: serviceName, params: params})
                res({serviceName:serviceName,result:result})
            }

        })

        

    }

    leave = () => {

        this.brokerInterface.publishMessage(`leave/${this.nodeId}`, JSON.stringify(this.module.serviceIndex.getServicesForBroker()))

    }

    setObserverId(observerId:number) {
        this.observerId = observerId
    }

}

class UI {

    services = document.querySelector('ul')
    diagramDiv = document.getElementById('diagram')


    joint : any
    graph : any
    paper : any

    constructor() {

        this.addService('input', 'ffffff')
        this.addService('output', 'd1d1d1')

        this.joint = joint as any
        this.graph = new this.joint.dia.Graph

        this.diagramDiv.addEventListener('dragover', (event) => event.preventDefault())
        this.diagramDiv.addEventListener('drop', this.dropElement)

        this.paper = new this.joint.dia.Paper({
            el: document.getElementById('diagram'),
            model: this.graph,
            width: 1200,
            height: 600,
            gridSize: 1
        });

    }

    addService = (serviceName:string, nodeId: string) => {

        let li : HTMLElement = document.createElement('li')
        li.setAttribute('id',`${serviceName}id${nodeId}`)
        li.setAttribute('class',`nodeId${nodeId}`)
        li.innerHTML = `${serviceName}`

        if( serviceName != 'input' && serviceName != 'output')
            li.innerHTML += `@ #${nodeId}`

        li.style.backgroundColor = `#${nodeId}`
        li.setAttribute('draggable', 'true')
        li.addEventListener('dragstart', this.dragElement)
        this.services.appendChild(li)
    }

    removeService = (serviceName: string, nodeId: string) => {

        let liToRemove = document.getElementById(`${serviceName}id${nodeId}`)
        this.services.removeChild(liToRemove)

    }

    removeServicesFromNode = (nodeId: string) => {

        let lis = document.querySelectorAll(`li.nodeId${nodeId}`)
        for(let i = 0; i < lis.length; i++)
            this.services.removeChild(lis[i])
    }

    setHandleClose = (handler: EventListener) => {

        window.addEventListener('beforeunload', handler)
    }

    dragElement = (event:any) => {

        event.dataTransfer.setData("originElementId", event.target.id)
        event.dataTransfer.setData("originOffsetX", event.offsetX)
        event.dataTransfer.setData("originOffsetY", event.offsetY)

    }

    dropElement = (event:any) => {

        event.preventDefault()
        const originElement = document.getElementById(event.dataTransfer.getData("originElementId"))
        const compensateOffsetX = event.dataTransfer.getData("originOffsetX")
        const compensateOffsetY = event.dataTransfer.getData("originOffsetY")

        const comps = originElement.getAttribute('id').split('id')
        
        const serviceName = comps[0]
        const nodeId = comps[1]

        let color = `#${nodeId}`
 
        if(serviceName == 'input' || serviceName == 'output') {

            
            const ellipse = new this.joint.shapes.standard.Ellipse();
            ellipse.position(event.offsetX - compensateOffsetX, event.offsetY - compensateOffsetY)

            ellipse.resize(140, 70) 
            
            ellipse.attr({
                body: {
                    fill: color
                },
                label: {
                    text: originElement.innerHTML,
                    fill: 'black'
                }
            });
        
            ellipse.addTo(this.graph);


        }

        else {

            const rect = new this.joint.shapes.standard.Rectangle();
            rect.position(event.offsetX - compensateOffsetX, event.offsetY - compensateOffsetY)
            rect.resize(140, 60)
            rect.attr({
                body: {
                    fill: color
                },
                label: {
                    text: serviceName,
                    fill: 'black'
                }
            });
        
            rect.addTo(this.graph)

        }

        

    }

    buildBlockOfService = () => {



    }

}