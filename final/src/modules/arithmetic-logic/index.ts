import {BrokerInterface} from '../../broker-interface/broker-interface'
import { InfoSecNode } from '../../common/Node';
import { ArithmeticLogicModule } from './services';

class ArithmeticLogicNode extends InfoSecNode {

    constructor() {
        super(new ArithmeticLogicModule())
    }

}

let node = new ArithmeticLogicNode()

