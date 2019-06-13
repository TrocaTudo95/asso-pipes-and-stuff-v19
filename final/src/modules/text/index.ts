import {BrokerInterface} from '../../broker-interface/broker-interface'
import { InfoSecNode } from '../../common/Node';
import { TextModule } from './services';

class TextNode extends InfoSecNode {

    constructor() {
        super(new TextModule())
    }

}

let node = new TextNode()
