import { ServiceIndex } from "../../common/service-index";
import { InfoSecModule } from "../../common/Module";

export class ArithmeticLogicModule extends InfoSecModule {

    constructor() {

        super('ArithmeticLogicModule')

        let services = [
            {
                serviceName: 'sum',
                serviceDescription: 'Sum list of numbers',
                params: ['Array of Numbers to be summed up'],
                paramsType: ['Array of Numbers'],
                numberOfParams: 2,
                returnType: 'number',
                service: this.sum,
                provider: "-1"
            },
            {
                serviceName: 'sub',
                serviceDescription: 'Sub list of numbers',
                params: ['Array of Numbers to be sub down'],
                paramsType: ['Array of Numbers'],
                numberOfParams: 2,
                returnType: 'number',
                service: this.sub,
                provider: "-1"
            }


        ]

        this.serviceIndex = new ServiceIndex(services)

    }

    sum = (params: any[]) : number => {

        return params.reduce((acc,curr) => acc + curr)
    
    }

    sub = (params: any[]) : number => {
        
        return params.reduce((acc,curr) => acc - curr)
    }

}

