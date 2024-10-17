import { ILiveInteractor } from "../providers/interfaces/ILiveInteractor";
import { ILiveRepository } from "../providers/interfaces/ILiveRepository";

export class LiveInteractor implements ILiveInteractor{
    private _repository:ILiveRepository
 constructor(private repository:ILiveRepository){
    this._repository=repository
 }   
}