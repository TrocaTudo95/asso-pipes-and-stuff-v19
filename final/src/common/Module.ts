import { ServiceIndex, ServiceRequest } from "./service-index";

export abstract class InfoSecModule {

    serviceIndex: ServiceIndex
    name: string

    constructor(name:string) {
        this.name = name
    }

    executeService(service: ServiceRequest) {

    }

}