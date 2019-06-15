import { ServiceIndex } from "../../common/service-index";
import { InfoSecModule } from "../../common/Module";
import {Md5} from "md5-typescript";  /home/peteraya/Desktop/asso-pipes-and-stuff-v19/final/sha1.ts
import * as sha1 from '../../../sha1';


export class HashingModule extends InfoSecModule {

    constructor() {

        super('HashingModule')

        let services = [
            {
                serviceName: 'md5',
                serviceDescription: 'Hash string using MD5 algorithm',
                params: ['Original String'],
                paramsType: ['String'],
                numberOfParams: 1,
                returnType: 'string',
                service: this.md5,
                provider: "-1"
            },
            {
                serviceName: 'sha1',
                serviceDescription: 'Hash string using Sha1 algorithm',
                params: ['Original String'],
                paramsType: ['String'],
                numberOfParams: 1,
                returnType: 'string',
                service: this.sha1,
                provider: "-1"
            }
        ]

        this.serviceIndex = new ServiceIndex(services)

    }

    md5 = (input: any[]) : string => {

        try {

            let inputString : string = input[0] as string
            return Md5.init(input[0])
        }

        catch(error) {
            return error
        }

    }

    sha1 = (input: any[]) : string => {

        try {

            let inputString : string = input[0] as string
            return sha1.sha1(input[0])
        }

        catch(error) {
            return error
        }

    }

}
