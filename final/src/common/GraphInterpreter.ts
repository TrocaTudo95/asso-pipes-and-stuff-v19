import { Service } from "./service-index";
import { InfoSecNode } from "./Node";

export abstract class AbstractElement {

    abstract async interpret(context : Context) : Promise<any>
    
    shape : any
    elementId : string
    children : AbstractElement[] = []
    serviceName : string

    constructor(shape : any, serviceName : string) {
        this.shape = shape
        this.elementId = shape.id
        this.serviceName = serviceName
    }

}

export class ServiceElement extends AbstractElement {

    service : Service
    

    constructor(shape : any, service: Service) {
        super(shape, service.serviceName)
        this.service = service
    }

    async interpret(context : Context) : Promise<any> {

        let paramsPromises = []
        
        for(let i = 0; i < this.children.length; i++) {
            paramsPromises.push(this.children[i].interpret(context))
        }

        const params = (await Promise.all(paramsPromises)).map(element => element.result)

       
        const result = await context.node.requestService(this.service.serviceName, this.service.provider, params)
        this.shape.attr('.label/text', `${this.service.serviceName} \n ${result.result}`)

        return await context.node.requestService(this.service.serviceName, this.service.provider, params)
    }

}

export class OutputElement extends AbstractElement {

    constructor(shape : any) {
        super(shape, 'output')
    }

    interpret(context : Context) : Promise <any> {
        return this.children[0].interpret(context)
    }

}

export class InputElement extends AbstractElement {

    value : any

    constructor(shape : any) {
        super(shape, 'input')
    }

    interpret(context : Context) {
        return new Promise(res => res ({serviceName:'input', result: this.value}))
    }

}

export class Context {
    
    node : InfoSecNode

    constructor(node:InfoSecNode) {
        this.node = node
    }

}