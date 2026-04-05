import { Observable } from "rxjs";

export class LinkToObserver<T> {
    #obseravble?: Observable<T | undefined>;

    get hasLink() {
        return this.#obseravble !== undefined;
    }

    link(fn: () => T) {
        this.#obseravble = new Observable<T | undefined>((subscriber) => {
            const result = fn ? fn() : undefined;
            subscriber.next(result);
            subscriber.complete();
        });
    }

    result(): Observable<T | undefined> {
        return this.#obseravble!;
    }
}