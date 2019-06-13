import { ServiceIndex, ServiceRequest } from "./service-index";

export abstract class InfoSecModule {

    serviceIndex: ServiceIndex
    name: string

    constructor(name:string) {
        this.name = name
    }

    executeService(serviceRequest: ServiceRequest) : any {

        const service = this.serviceIndex.findService(serviceRequest.serviceName, "-1")

        //make some validations (number of arguments and type)

        let result = service.service(serviceRequest.params)

        console.log('service request')
        console.log(serviceRequest)

        console.log('executing service')
        console.log(service)

        console.log(result)

        return result

    }

}