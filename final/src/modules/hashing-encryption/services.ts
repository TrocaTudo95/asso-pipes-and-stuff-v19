import { ServiceIndex } from "../../common/service-index";
import { InfoSecModule } from "../../common/Module";

export class HashingModule extends InfoSecModule {

    constructor() {

        super('HashingModule')

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
