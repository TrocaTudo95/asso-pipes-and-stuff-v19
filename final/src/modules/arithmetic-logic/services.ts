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
            },
            {
                serviceName: 'product',
                serviceDescription: 'Multiply list of numbers',
                params: ['Array of Numbers to be multiplied'],
                paramsType: ['Array of Numbers'],
                numberOfParams: 2,
                returnType: 'number',
                service: this.prod,
                provider: "-1"
            },
            {
                serviceName: 'and',
                serviceDescription: 'Apply and operator to list of numbers',
                params: ['Array of Numbers where operator will apply'],
                paramsType: ['Array of Numbers'],
                numberOfParams: 2,
                returnType: 'number',
                service: this.and,
                provider: "-1"
            },
            {
                serviceName: 'or',
                serviceDescription: 'Apply or operator to list of numbers',
                params: ['Array of Numbers where operator will apply'],
                paramsType: ['Array of Numbers'],
                numberOfParams: 2,
                returnType: 'number',
                service: this.or,
                provider: "-1"
            },
            {
                serviceName: 'xor',
                serviceDescription: 'Apply xor operator to list of numbers',
                params: ['Array of Numbers where operator will apply'],
                paramsType: ['Array of Numbers'],
                numberOfParams: 2,
                returnType: 'number',
                service: this.xor,
                provider: "-1"
            },
            {
                serviceName: 'average',
                serviceDescription: 'Get the average of a list of numbers',
                params: ['Array of Numbers to calculate the average'],
                paramsType: ['Array of Numbers'],
                numberOfParams: 1,
                returnType: 'number',
                service: this.average,
                provider: "-1"
            }




        ]

        this.serviceIndex = new ServiceIndex(services)

    }

    sum = (params: any[]) : number => {

        return parseFloat(params[0]) + parseFloat(params[1])

    }

    sub = (params: any[]) : number => {

        return parseFloat(params[0]) - parseFloat(params[1])
    }

    prod = (params: any[]) : number => {

        return parseFloat(params[0]) * parseFloat(params[1])
    }

    and = (params: any[]) : number => {

        return parseFloat(params[0]) && parseFloat(params[1])
    }

    or = (params: any[]) : number => {

        return parseFloat(params[0]) || parseFloat(params[1])
    }

    xor = (params: any[]) : number => {
        return !(parseFloat(params[0])&& parseFloat(params[1])) && parseFloat(params[0]) || parseFloat(params[1])
    }

    average = (params: any[]) : number => {
        let sum =0
         sum = params.reduce((acc,curr) => {
             let temp = 0
             temp = parseFloat(curr)
            return acc + temp
        },0);
        return sum/params.length;
    }

}
