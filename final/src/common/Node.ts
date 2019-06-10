import { InfoSecModule } from "./Module";
import { BrokerInterface } from "../broker-interface/broker-interface";

export class InfoSecNode {

    module: InfoSecModule
    brokerInterface: BrokerInterface

    static host : string = 'localhost'
    static port : number = 9001

    constructor(module: InfoSecModule) {

        this.module = module
        this.brokerInterface = new BrokerInterface(InfoSecNode.host,InfoSecNode.port,'',this.module.name)
        this.initialize()
        console.log(this)
    }

    initialize = async () => {

        try {
            await this.brokerInterface.connect()
            await this.brokerInterface.subscribeToTopic('/services')
            this.brokerInterface.publishMessage('/new',JSON.stringify(this.module.serviceIndex.getServicesForBroker()))
            await this.brokerInterface.subscribeToTopic('/new')
            
            let promises : Promise<string>[] = []
            this.module.serviceIndex.getServices().forEach(service => promises.push(this.brokerInterface.subscribeToTopic(`/${service.serviceName}`)))

            await Promise.all(promises)

        }

        catch(e) {
            console.log(e)
        }

    }


}