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
                numberOfParams: 1,
                returnType: 'number',
                service: this.sum,
            }
        ]

        this.serviceIndex = new ServiceIndex(services)

    }

    sum = (params: number[]) : number => {

        return params.reduce((acc,curr) => acc + curr)
    
    }

}

