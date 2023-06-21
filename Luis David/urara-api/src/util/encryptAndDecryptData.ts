import CryptoJS from "crypto-js";

class EncryptAndDecryptData {
    private key = process.env.PASSENCRYPTDATA;

    public encrypt(data: any){
        return CryptoJS.AES.encrypt(JSON.stringify(data), this.key!).toString();
    }

    public decrypt(dataEncrypt: any){
        let bytes = CryptoJS.AES.decrypt( dataEncrypt, this.key! );
        return JSON.parse( bytes.toString(CryptoJS.enc.Utf8) );
    }
}

export const encryptAndDecryptData = new EncryptAndDecryptData();