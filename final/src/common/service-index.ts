export interface Service {
    serviceName: string
    serviceDescription: string
    params: string[]
    paramsType: string[]
    numberOfParams: number
    returnType: string
    service: Function
}

export class ServiceIndex {

    constructor(private services:Service[]) {}

    getServices = () : Service[] => {
        return this.services
    }

    getServicesForBroker = () : Object => {
        return this.services.map(service => {
            return {
                serviceName: service.serviceName, 
                serviceDescription: service.serviceDescription,
                params: service.params,
                paramsType: service.paramsType,
                returnType: service.returnType
            }
        })
    }
    
    addService = (service: Service) : void => {
        this.services.push(service)
    }

}