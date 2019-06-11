import {BrokerInterface} from '../../broker-interface/broker-interface'
import { InfoSecNode } from '../../common/Node';
import { ConversionModule } from './services';

class ConversionNode extends InfoSecNode {

    constructor() {
        super(new ConversionModule())
    }

}

let node = new ConversionNode()
