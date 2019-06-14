import { InfoSecModule } from "./Module";
import { BrokerInterface, Observer, fetchMQTT } from "../broker-interface/broker-interface";
import { ServiceIndex, ServiceRequest, ServiceReply, Service } from "./service-index";
import * as joint from './joint-min'
import * as _ from 'lodash';
import * as backbone from 'backbone';
import { InputElement, OutputElement, ServiceElement, Context, AbstractElement } from "./GraphInterpreter";

export class InfoSecNode implements Observer {
    
    static host : string = 'localhost'
    static port : number = 9001
    static requestNumber = 0
    
    module: InfoSecModule
    brokerInterface: BrokerInterface
    serviceLocator: ServiceIndex
    nodeId : string = Math.floor(Math.random() * 16777216).toString(16)
    ui : UI
    knownNodes : string[] = [this.nodeId]
    observerId : number

    elementList : any = {}

    context : Context

    constructor(module: InfoSecModule) {

        this.module = module

        this.brokerInterface = new BrokerInterface(InfoSecNode.host,InfoSecNode.port,this.getNodeName())
        this.brokerInterface.addObserver(this)
        
        this.serviceLocator = new ServiceIndex([])
        
        this.initialize()  

        this.ui = new UI(this, this.run)
        this.ui.setHandleClose(this.leave)

        this.context = new Context(this)
        
    }

    getNodeName = () => {
        return this.module.name + "#" + this.nodeId
    }

    initialize = async () => {

        try {
            
            await this.brokerInterface.connect()
            await this.brokerInterface.publishMessage(`new/${this.nodeId}`,JSON.stringify({}))
            await this.brokerInterface.subscribeToTopics(['new/+', 'services/+','leave/+', 'newService/+', '/removeService/+'])
            
            this.module.serviceIndex.getServices().forEach(service => {
                
                this.ui.addService(service.serviceName, this.nodeId)
                
            })
            
        }

        catch(e) {
            console.log(e)
        }

    }

    announceService = async (serviceName : string) => {

        try {
            await this.brokerInterface.publishMessage(`newService/${this.nodeId}`, JSON.stringify(this.module.serviceIndex.findServiceForAnnouncement(serviceName)))
            await this.brokerInterface.subscribeToTopic(`service/${this.nodeId}/${serviceName}/+`)
            this.module.serviceIndex.makeServiceAvailable(serviceName)
        }

        catch(e) {
            console.log(e)
        }

    }

    cancelServiceToNetwork = (serviceName : string) => {



    }

    receiveMessage = (topic:string, message : any) : void => {

        console.log(`received msg on topic ${topic}`)

        const topicLevels : string[] = topic.split('/')

        let ignore = false

        /**
         * Ignore services of already known nodes and own services (own id included in knownNodes)
         */

        if(this.knownNodes.includes(topicLevels[1]) && topicLevels[0] == 'services')
            ignore = true

        /**
         * Ignore own requests for newService and removeService
         */
        
        if(topicLevels[1] == this.nodeId && (topicLevels[0] == 'newService' || topicLevels[0] == 'removeService'))
            ignore = true

        if(ignore)
            return
        
        console.log(`processing msg received on topic ${topic}`)

        if(topicLevels[0] == 'new') {
            this.onNewNode(topicLevels[1])
        }
        else if(topicLevels[0] == 'services') {
            this.addServicesOfNode(message, topicLevels[1])
        }

        else if(topicLevels[0] == 'leave') {
            this.removeServicesOfNode(topicLevels[1])
        }

        else if(topicLevels[0] == 'newService') {
            this.addServiceOfNode(message, topicLevels[1])
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

    onNewNode = (nodeId: string) => {

        this.brokerInterface.publishMessage(`services/${this.nodeId}`,JSON.stringify(this.module.serviceIndex.getServicesForBroker()))
          
    }

    addServicesOfNode = (message: any, nodeId: string) => {

        for(let i = 0; i < message.length; i++) {
            this.addServiceOfNode({...message[i], provider: nodeId }, nodeId)
        }

        this.knownNodes.push(nodeId)

    }

    addServiceOfNode = (service: Service, nodeId: string) => {

        if(this.serviceLocator.addService({...service, provider: nodeId }))
            this.ui.addService(service.serviceName, nodeId)

    }

    removeServicesOfNode = (nodeId: string) => {

        this.serviceLocator.removeServicesFromNode(nodeId)
        this.ui.removeServicesFromNode(nodeId)
        this.knownNodes = this.knownNodes.filter(node => node != nodeId)

    }

    requestService = async (serviceName: string, provider: string, params: any[]) : Promise<ServiceReply> => {

        return new Promise((res,rej) => {

            let service = this.findService(serviceName, provider)

            if(service.provider != "-1") {

                let serviceRequest : ServiceRequest = {
                    serviceName: service.serviceName,
                    params: params,
                }
    
                try {
    
                    const requestId = `${this.nodeId}REQ${InfoSecNode.requestNumber++}`
                    const requestTopic = `service/${service.provider}/${service.serviceName}/${requestId}`
                    const message = JSON.stringify({serviceRequest: serviceRequest})
                    const replyTopic = `serviceReply/${service.provider}/${service.serviceName}/${requestId}`
    
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

    findService = (serviceName : string, provider: string) => {

        const localService = this.module.serviceIndex.findService(serviceName, "-1")
        if(localService != undefined)
            return localService
        
        return this.serviceLocator.findService(serviceName, provider)
        
    }

    run = async (event : any) => {


        let key = event.keyCode ? event.keyCode : event.which;

        if(key == '13') {
            
            const outputElement : OutputElement = this.elementList[this.elementList.outputId]

            const finalResult = await outputElement.interpret(this.context)

            outputElement.shape.attr('.label/text', `output \n ${finalResult.result}`)

        }
        else if(key == 8) {
            this.ui.graph.clear()
        }

    }

}

class UI {

    node : InfoSecNode
    services = document.querySelector('ul')
    diagramDiv = document.getElementById('diagram')


    joint : any
    graph : any
    paper : any

    constructor(node : InfoSecNode, runListener : EventListener) {

        this.node = node

        this.addService('input', 'ffffff')
        this.addService('output', 'd1d1d1')

        this.joint = joint as any
        this.graph = new this.joint.dia.Graph
        this.graph.on('change:source change:target', this.linkElements)

        this.diagramDiv.addEventListener('dragover', (event) => event.preventDefault())
        this.diagramDiv.addEventListener('drop', this.dropElement)
        
        this.paper = new this.joint.dia.Paper({
            el: document.getElementById('diagram'),
            model: this.graph,
            width: 1200,
            height: 5000,
            gridSize: 1,
        })

        this.paper.on("cell:pointerdblclick",this.editInput)

        window.addEventListener('keyup', runListener)

    }

    addService = (serviceName:string, nodeId: string) => {

        let li : HTMLElement = document.createElement('li')
        li.setAttribute('id',`${serviceName}id${nodeId}`)
        li.setAttribute('class',`nodeId${nodeId}`)
        li.innerHTML = `${serviceName}`

        if(serviceName != 'input' && serviceName != 'output') {
            li.innerHTML += `@ #${nodeId}`

            if(nodeId == this.node.nodeId) {
                let checkbox = document.createElement('input')
                checkbox.setAttribute('type','checkbox')
                checkbox.addEventListener('input',(event: Event) => this.handleServiceCheckBox(checkbox,serviceName))
                li.appendChild(checkbox)
            }
        }
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

        const service = this.node.findService(serviceName, nodeId)

        let shape : any = null

        let abstractElement : AbstractElement = null
 
        if(serviceName == 'input') {

            shape = this.createGraphElement(event.offsetX - compensateOffsetX,event.offsetY - compensateOffsetY,serviceName,color,0,1)
            abstractElement = new InputElement(shape)
            this.node.elementList[shape.id] = abstractElement 
            shape.addTo(this.graph)
            this.insertInput(shape, abstractElement)
            
        }

        else if (serviceName == 'output') {

            shape = this.createGraphElement(event.offsetX - compensateOffsetX,event.offsetY - compensateOffsetY,serviceName,color,1,0)
            abstractElement = new OutputElement(shape)
            this.node.elementList[shape.id] = abstractElement
            this.node.elementList.outputId = shape.id
            shape.addTo(this.graph)

        }

        else {

            shape = this.createGraphElement(event.offsetX - compensateOffsetX,event.offsetY - compensateOffsetY,serviceName,color,service.numberOfParams,1)
            abstractElement = new ServiceElement(shape,service)
            this.node.elementList[shape.id] = abstractElement
            shape.addTo(this.graph)

        }

        shape.attributes.abstractElement = abstractElement

    }

    createGraphElement = (x: number, y: number, name: string, color: string, numberInPorts: number, numberOutPorts: number) =>  {

        let inPorts = []
        let outPorts = []

        for(let i = 0; i < numberInPorts; i++) {
            inPorts.push(`in${i+1}`)
        }

        for(let i = 0; i < numberOutPorts; i++) {
            outPorts.push(`out${i+1}`)
        }

        let shape = new this.joint.shapes.devs.Model({
            
            attrs: {
                rect: {
                    fill: color
                },
                '.label': {
                    text: name, 'ref-x': .5, 'ref-y': .2
                }
            },

            size: {
                width:140,
                height: 60
            },

            position: {
                x: x,
                y: y
            },
            inPorts: inPorts,
            outPorts:  outPorts,
            ports: {
                groups: {
                    'in': {
                        attrs: {
                            '.port-body': {
                                fill: '#16A085'
                            }
                        }
                    },
                    'out': {
                        attrs: {
                            '.port-body': {
                                fill: '#E74C3C'
                            }
                        }
                    }
                }
            },
        })

        return shape

    }

    linkElements = (link : any) => {

        let source = this.node.elementList[link.attributes.source.id]
        let target = this.node.elementList[link.attributes.target.id]

        if(target != undefined)
            target.children.push(source)
      
    }

    insertInput = (shape : any, element : AbstractElement) => {

        const inputElement = element as InputElement
        const input = prompt('Insert Input')
        shape.attr('.label/text', `input \n ${input}`)
        inputElement.value = input
    }

    editInput = (cell : any) => {

        const abstractElement = cell.model.attributes.abstractElement as AbstractElement
        if(abstractElement.serviceName == 'input') {
            this.insertInput(cell.model, abstractElement)
        }   
    }

    handleServiceCheckBox = (checkBox : HTMLInputElement, serviceName: string) => {


        if(checkBox.checked) {
            console.log("checked")
            this.node.announceService(serviceName)
        }
        else
            console.log("not checked")

    }

}