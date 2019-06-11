export interface Service {
    serviceName: string
    serviceDescription: string
    params: string[]
    paramsType: string[]
    numberOfParams: number
    returnType: string
    service: Function
    provider: number
}

export interface ServiceRequest {
    serviceName: string,
    params: any[],
    requestId: string
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


}