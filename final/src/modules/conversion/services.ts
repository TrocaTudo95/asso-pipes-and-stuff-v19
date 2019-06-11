import { ServiceIndex } from "../../common/service-index";
import { InfoSecModule } from "../../common/Module";

export class ConversionModule extends InfoSecModule {

    constructor() {

        super('ConversionModule')

        let services = [
            {
                serviceName: 'to_uppercase',
                serviceDescription: 'Transform string to uppercase',
                params: ['Original String'],
                paramsType: ['String'],
                numberOfParams: 1,
                returnType: 'string',
                service: this.toUpperCase,
            }
        ]

        this.serviceIndex = new ServiceIndex(services)

    }

    toUpperCase = (input: string) : string => {

        return input.toUpperCase()
    
    }

}