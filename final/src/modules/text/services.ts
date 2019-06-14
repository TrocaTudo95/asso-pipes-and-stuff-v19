import { ServiceIndex } from "../../common/service-index";
import { InfoSecModule } from "../../common/Module";

export class TextModule extends InfoSecModule {

    constructor() {

        super('TextModule')

        let services = [
            {
                serviceName: 'to_uppercase',
                serviceDescription: 'Transform string to uppercase',
                params: ['two strings'],
                paramsType: ['Array of Strings'],
                numberOfParams: 1,
                returnType: 'string',
                service: this.toUpperCase,
                provider: "-1",
                available : false
            },
            {
                serviceName: 'to_lowercase',
                serviceDescription: 'Transform string to lowercase',
                params: ['Original String'],
                paramsType: ['String'],
                numberOfParams: 1,
                returnType: 'string',
                service: this.toLowerCase,
                provider: "-1",
                available: false
            },
            {
                serviceName: 'concat',
                serviceDescription: 'Concat two strings',
                params: ['Original String'],
                paramsType: ['String'],
                numberOfParams: 2,
                returnType: 'string',
                service: this.concat,
                provider: "-1",
                available: false
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


    toLowerCase = (input: any[]) : string => {

        try {

            return input[0].toLowerCase()

        }

        catch(error) {
            return error
        }

    }

    concat = (input: any[]) : string => {
        return input[0] + input[1]
    }

}
