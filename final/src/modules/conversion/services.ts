import { ServiceIndex } from "../../common/service-index";
import { InfoSecModule } from "../../common/Module";

export class ConversionModule extends InfoSecModule {

  constructor() {

    super('ConversionModule')

    let services = [
      {
        serviceName: 'to_hexadecimal',
        serviceDescription: 'Convert string to hexadecimal',
        params: ['Array with the string to be converted'],
        paramsType: ['String'],
        numberOfParams: 1,
        returnType: 'string',
        service: this.toHexadecimal,
        provider: "-1"
      },
      {
        serviceName: 'from_hexadecimal',
        serviceDescription: 'Convert hexadecimal expression to string',
        params: ['Array with the string to be converted'],
        paramsType: ['Array of Numbers'],
        numberOfParams: 1,
        returnType: 'string',
        service: this.fromHexadecimal,
        provider: "-1"
      },
      {
        serviceName: 'to_binary',
        serviceDescription: 'Convert string to binary',
        params: ['Array with the string to be converted'],
        paramsType: ['String'],
        numberOfParams: 1,
        returnType: 'string',
        service: this.toBinary,
        provider: "-1"
      },
      {
        serviceName: 'from_binary',
        serviceDescription: 'Convert binary expression to string',
        params: ['Array with the string to be converted'],
        paramsType: ['String'],
        numberOfParams: 1,
        returnType: 'string',
        service: this.fromBinary,
        provider: "-1"
      },
      {
        serviceName: 'to_base64',
        serviceDescription: 'Convert string to base64',
        params: ['Array with the string to be converted'],
        paramsType: ['String'],
        numberOfParams: 1,
        returnType: 'number',
        service: this.toBase64,
        provider: "-1"
      },
      {
        serviceName: 'from_base64',
        serviceDescription: 'Convert base64 expression to string',
        params: ['Array with the string to be converted'],
        paramsType: ['String'],
        numberOfParams: 1,
        returnType: 'string',
        service: this.fromBase64,
        provider: "-1"
      },
      {
        serviceName: 'urlEncode',
        serviceDescription: 'Encode a Url',
        params: ['Array with the url to be encoded'],
        paramsType: ['String'],
        numberOfParams: 1,
        returnType: 'string',
        service: this.urlEncode,
        provider: "-1"
      },
      {
        serviceName: 'urlDecode',
        serviceDescription: 'Decode an encoded Url',
        params: ['Array with the url to be decoded'],
        paramsType: ['String'],
        numberOfParams: 1,
        returnType: 'string',
        service: this.urlDecode,
        provider: "-1"
      }

    ]

    this.serviceIndex = new ServiceIndex(services)

  }


  stringToBin_Hex(str: string, base: number) {

    return str.replace(/[\s\S]/g, function(str) {
        str = "00000000".slice(String(str.charCodeAt(0).toString(base)).length) + str.charCodeAt(0).toString(base);
        return !1 == false ? str : str + " "
    });
}

bin_HexToString(str: string, base: number) {
    str = str.replace(/\s+/g, '');
    str = str.match(/.{1,8}/g).join(" ");

    var newBinary = str.split(" ");
    var binaryCode = [];

    for (var i = 0; i < newBinary.length; i++) {
        binaryCode.push(String.fromCharCode(parseInt(newBinary[i], base)));
    }

    return binaryCode.join("");
}

  toHexadecimal = (input: any[]) : string => {

    return parseInt(input[0]).toString(16)

  }

  fromHexadecimal = (input: any[]) : string => {
    return parseInt(input[0],16).toString()

  }

  toBinary = (input: any[]) : string => {
      return parseInt(input[0]).toString(2)
  }

  fromBinary = (input: any[]) : string => {

    return parseInt(input[0],2).toString()

  }

  toBase64 = (input: any[]) : string => {

    return btoa(input[0])

  }

  fromBase64 = (input: any[]) : string => {

    return atob(input[0])

  }

  urlEncode = (input: any[]) : string => {

    return encodeURIComponent(input[0])

  }

  urlDecode = (input: any[]) : string => {

    return decodeURIComponent(input[0])

  }

}
