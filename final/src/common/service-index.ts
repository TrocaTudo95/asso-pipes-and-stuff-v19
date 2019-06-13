export interface Service {
    serviceName: string
    serviceDescription: string
    params: string[]
    paramsType: string[]
    numberOfParams: number
    returnType: string
    service: Function
    provider: string
}

export interface ServiceRequest {
    serviceName: string,
    params: any[]
}

export interface ServiceReply {
    serviceName: string,
    result: any
}

export class ServiceIndex {

    constructor(private services:Service[]) {}

    getServices = () : Service[] => {
        return this.services
    }

    getServicesForBroker = () : Service[] => {
        
        return this.services.map(service => {
            return {
                serviceName: service.serviceName, 
                serviceDescription: service.serviceDescription,
                params: service.params,
                paramsType: service.paramsType,
                returnType: service.returnType,
                numberOfParams: service.numberOfParams,
                provider: service.provider,
                service: undefined
            }
        })
    }
    
    addService = (service: Service) : void => {
        this.services.push(service)
    }

    findService = (serviceName: string) : Service => {

        return this.services.filter(service => service.serviceName == serviceName)[0]

    }

    removeService = (serviceName: string, nodeId: string) : void => {

        console.log(this.services)

        console.log(parseInt(nodeId,16))

        this.services = this.services.filter(service => service.serviceName != serviceName && service.provider != nodeId)
        
        
    
    }

    removeServicesFromNode = (nodeId: string) : void => {

        console.log(this.services)

        this.services = this.services.filter(service => service.provider != nodeId)

        console.log(this.services)

    }


}