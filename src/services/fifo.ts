export class fifo {

    _fifo : any[];

    constructor(public maxsize: number) {
        this._fifo = new Array(maxsize);
    }

    push(stuff: any) {
        if (this._fifo.length == this.maxsize)this._fifo.shift();
        this._fifo.push(stuff);
    }

}
