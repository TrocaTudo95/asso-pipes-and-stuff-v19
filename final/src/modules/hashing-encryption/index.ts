import {BrokerInterface} from '../../broker-interface/broker-interface'
import { InfoSecNode } from '../../common/Node';
import { HashingModule } from './services';

class HashingNode extends InfoSecNode {

    constructor() {
        super(new HashingModule())
    }

}

let node = new HashingNode()
