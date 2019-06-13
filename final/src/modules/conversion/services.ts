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
                provider: "-1"
            }
        ]

        this.serviceIndex = new ServiceIndex(services)

    }

    toUpperCase = (input: any[]) : string => {

        try {
            
            let inputString : string = input[0] as string
            return input[0].toUpperCase()

        }

        catch(error) {
            return error
        }

    }

}