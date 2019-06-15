export interface Service {
    serviceName: string
    serviceDescription: string
    params: string[]
    paramsType: string[]
    numberOfParams: number
    returnType: string
    service: Function
    provider: string
    available : boolean
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
        
        return this.services.filter(service => service.available).map(service => {
            return {
                serviceName: service.serviceName, 
                serviceDescription: service.serviceDescription,
                params: service.params,
                paramsType: service.paramsType,
                returnType: service.returnType,
                numberOfParams: service.numberOfParams,
                provider: service.provider,
                service: undefined,
                available: service.available
            }
        })
    }
    
    addService = (service: Service) : boolean => {
        
        if(this.findService(service.serviceName, service.provider) == undefined) {
            this.services.push(service)
            return true
        }
        return false
    }

    findService = (serviceName: string, nodeId: string) : Service => {

        return this.services.filter(service => service.serviceName == serviceName && service.provider == nodeId)[0]

    }

    removeService = (serviceName: string, nodeId: string) : void => {

        this.services = this.services.filter(service => !(service.serviceName == serviceName && service.provider == nodeId))
            
    }

    removeServicesFromNode = (nodeId: string) : void => {

        this.services = this.services.filter(service => service.provider != nodeId)

    }

    findServiceForAnnouncement = (serviceName: string) : Service => {

        let service = this.getServices().filter(service => service.serviceName == serviceName)[0]

        return {...service, service: undefined}

    }

    makeServiceAvailable = (serviceName : string) => {

        this.findService(serviceName,"-1").available = true

    }

    makeServiceUnavailable = (serviceName : string) => {

        this.findService(serviceName,"-1").available = false

    }


}